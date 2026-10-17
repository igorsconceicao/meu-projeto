"use server";

import { revalidatePath } from "next/cache";
import {
  CAMPOS_TECNICOS,
  CONFIANCAS,
  ESTADOS,
  TABELAS_UNICAS,
  type TabelaTecnica,
} from "@/lib/admin-tecnicos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export type ResultadoTecnico = { erro: string | null; salvoEm?: string };

function eTabela(t: string): t is TabelaTecnica {
  return t in CAMPOS_TECNICOS;
}

async function clienteAutenticado() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? supabase : null;
}

function montarLinha(tabela: TabelaTecnica, veiculoId: string, dados: FormData) {
  const linha: Record<string, unknown> = { veiculo_id: veiculoId };
  for (const campo of CAMPOS_TECNICOS[tabela]) {
    const bruto = String(dados.get(campo.nome) ?? "").trim();
    if (campo.obrigatorio && !bruto) return { erro: `Preencha “${campo.rotulo}”.` };
    if (campo.tipo === "estado") {
      if (!ESTADOS.some((e) => e.valor === bruto)) return { erro: `Valor inválido em “${campo.rotulo}”.` };
      linha[campo.nome] = bruto;
    } else if (campo.tipo === "numero") {
      const n = bruto ? Number(bruto.replace(",", ".")) : null;
      if (n !== null && !Number.isFinite(n)) return { erro: `“${campo.rotulo}” precisa ser um número.` };
      linha[campo.nome] = n;
    } else {
      linha[campo.nome] = bruto || null;
    }
  }

  const fonte = String(dados.get("fonte_url") ?? "").trim();
  if (!/^https:\/\/\S+$/i.test(fonte)) {
    return { erro: "Informe o link da fonte (começando com https://). Todo dado técnico precisa de fonte." };
  }
  const confianca = String(dados.get("confianca") ?? "nao_confirmado");
  if (!CONFIANCAS.some((c) => c.valor === confianca)) return { erro: "Nível de confiança inválido." };
  const consultado = String(dados.get("consultado_em") ?? "").trim();
  if (consultado && !/^\d{4}-\d{2}-\d{2}$/.test(consultado)) return { erro: "Data de consulta inválida." };

  linha.fonte_url = fonte;
  linha.confianca = confianca;
  linha.evidencia = String(dados.get("evidencia") ?? "").trim() || null;
  linha.consultado_em = consultado || new Date().toISOString().slice(0, 10);
  linha.atualizado_em = new Date().toISOString();

  if (tabela === "multimidias") {
    // Cabo/sem fio confirmados exigem que o recurso exista na central.
    for (const [base, rotulo] of [["carplay", "CarPlay"], ["android_auto", "Android Auto"]] as const) {
      const subs = [linha[`${base}_cabo`], linha[`${base}_sem_fio`]];
      if (linha[base] === "nao_disponivel" && subs.some((s) => s === "confirmado" || s === "depende_versao")) {
        return { erro: `${rotulo} está como “não disponível”, mas a conexão por cabo/sem fio está confirmada. Revise.` };
      }
    }
  }
  return { linha };
}

/**
 * Grava um bloco de dados técnicos. Fichas e multimídia têm uma linha por
 * veículo; iluminação, palhetas e interruptores, uma linha por posição
 * (`posicao_original` identifica a linha que está sendo editada).
 */
export async function salvarDadoTecnico(
  tabela: string,
  veiculoId: string,
  _anterior: ResultadoTecnico,
  dados: FormData,
): Promise<ResultadoTecnico> {
  if (!eTabela(tabela)) return { erro: "Tabela desconhecida." };
  const supabase = await clienteAutenticado();
  if (!supabase) return { erro: "Sessão expirada. Entre novamente no painel." };

  const r = montarLinha(tabela, veiculoId, dados);
  if ("erro" in r) return { erro: r.erro ?? "Dados inválidos." };

  let erro: string | null = null;
  if (TABELAS_UNICAS.includes(tabela)) {
    const { error } = await supabase.from(tabela).upsert(r.linha, { onConflict: "veiculo_id" });
    erro = error?.message ?? null;
  } else {
    const original = String(dados.get("posicao_original") ?? "").trim();
    const { error } = original
      ? await supabase.from(tabela).update(r.linha).eq("veiculo_id", veiculoId).eq("posicao", original)
      : await supabase.from(tabela).insert(r.linha);
    if (error?.code === "23505") erro = "Já existe um item com essa posição para este veículo.";
    else erro = error?.message ?? null;
  }
  if (erro) return { erro: `Não foi possível salvar: ${erro}` };

  revalidatePath("/", "layout");
  return { erro: null, salvoEm: new Date().toISOString() };
}

export async function excluirDadoTecnico(
  tabela: string,
  veiculoId: string,
  posicao: string | null,
): Promise<ResultadoTecnico> {
  if (!eTabela(tabela)) return { erro: "Tabela desconhecida." };
  const supabase = await clienteAutenticado();
  if (!supabase) return { erro: "Sessão expirada. Entre novamente no painel." };

  let q = supabase.from(tabela).delete().eq("veiculo_id", veiculoId);
  if (!TABELAS_UNICAS.includes(tabela)) {
    if (!posicao) return { erro: "Posição não informada." };
    q = q.eq("posicao", posicao);
  }
  const { error } = await q;
  if (error) return { erro: `Não foi possível excluir: ${error.message}` };

  revalidatePath("/", "layout");
  return { erro: null };
}
