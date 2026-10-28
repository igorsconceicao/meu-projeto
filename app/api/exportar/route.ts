import { buscarVeiculos } from "@/lib/dados/veiculos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { EstadoConectividade, Veiculo } from "@/lib/tipos";

export const dynamic = "force-dynamic";

const ESTADO: Record<EstadoConectividade, string> = {
  confirmado: "Sim",
  nao_disponivel: "Não",
  nao_identificado: "Não identificado",
  depende_versao: "Depende da versão",
};

const COLUNAS: [string, (v: Veiculo) => string | number | null | undefined][] = [
  ["Marca", (v) => v.marca],
  ["Modelo", (v) => v.nomeComercial],
  ["Categoria", (v) => v.categoria],
  ["Propulsão", (v) => v.propulsao],
  ["Ano-modelo", (v) => v.anoModelo],
  ["Situação", (v) => v.situacao],
  ["Publicado no catálogo", (v) => (v.completude?.publicavel ? "Sim" : "Em verificação")],
  ["Pendências obrigatórias", (v) =>
    v.completude?.obrigatorios.filter((i) => !i.ok).map((i) => i.rotulo).join(" | ")],
  ["Versão de referência", (v) => v.tecnicos?.ficha?.versaoReferencia],
  ["Motor", (v) => v.tecnicos?.ficha?.motor],
  ["Potência", (v) => v.tecnicos?.ficha?.potencia],
  ["Torque", (v) => v.tecnicos?.ficha?.torque],
  ["Câmbio", (v) => v.tecnicos?.ficha?.cambio],
  ["Tração", (v) => v.tecnicos?.ficha?.tracao],
  ["Bateria", (v) => v.tecnicos?.ficha?.bateria],
  ["Autonomia", (v) => v.tecnicos?.ficha?.autonomia],
  ["Tela da central", (v) => v.tecnicos?.multimidia?.telaPolegadas],
  ["Sistema multimídia", (v) => v.tecnicos?.multimidia?.sistema],
  ["CarPlay", (v) => estado(v.tecnicos?.multimidia?.carplay)],
  ["CarPlay por cabo", (v) => estado(v.tecnicos?.multimidia?.carplayCabo)],
  ["CarPlay sem fio", (v) => estado(v.tecnicos?.multimidia?.carplaySemFio)],
  ["Android Auto", (v) => estado(v.tecnicos?.multimidia?.androidAuto)],
  ["Android Auto por cabo", (v) => estado(v.tecnicos?.multimidia?.androidAutoCabo)],
  ["Android Auto sem fio", (v) => estado(v.tecnicos?.multimidia?.androidAutoSemFio)],
  ["Farol principal", (v) => farol(v)?.tecnologia],
  ["Farol por versão", (v) => farol(v)?.versoes],
  ["Iluminação (todas as posições)", (v) =>
    v.tecnicos?.iluminacao
      .map((i) => `${i.posicao}: ${[i.tecnologia, i.codigo, i.oem].filter(Boolean).join(" / ")}`)
      .join(" | ")],
  ["Palhetas", (v) =>
    v.tecnicos?.palhetas
      .map((p) => `${p.posicao}: ${[p.medidaMm ? `${p.medidaMm} mm` : null, p.encaixe, p.oem].filter(Boolean).join(" / ")}`)
      .join(" | ")],
  ["Interruptores", (v) =>
    v.tecnicos?.interruptores
      .map((i) => `${i.posicao}: ${[i.tipo, i.oem, i.pinos ? `${i.pinos} pinos` : null].filter(Boolean).join(" / ")}`)
      .join(" | ")],
  ["Quantidade de versões", (v) => v.tecnicos?.versoes.length || null],
  ["Versões (da entrada à topo)", (v) =>
    v.tecnicos?.versoes
      .map((x) => [x.nome, x.motor, x.diferencial].filter(Boolean).join(" — "))
      .join(" | ")],
  ["Fonte das versões", (v) => v.tecnicos?.linhaVersoes?.fonteUrl ?? v.tecnicos?.versoes[0]?.fonteUrl],
  ["Página oficial", (v) => v.linkOficialUrl ?? v.verificadoBrUrl],
  ["Fonte da ficha técnica", (v) => v.tecnicos?.ficha?.fonteUrl],
  ["Fonte da multimídia", (v) => v.tecnicos?.multimidia?.fonteUrl],
  ["Consultado em", (v) => v.tecnicos?.ficha?.consultadoEm ?? v.verificadoBrEm],
];

function estado(e?: EstadoConectividade): string | null {
  return e ? ESTADO[e] : null;
}

function farol(v: Veiculo) {
  return v.tecnicos?.iluminacao.find((i) => /farol/i.test(i.posicao) && i.tecnologia);
}

/** Campo CSV no padrão do Excel brasileiro (separador ";"). */
function celula(valor: string | number | null | undefined): string {
  if (valor === null || valor === undefined) return "";
  const s = String(valor).replace(/\r?\n/g, " ");
  return /[;"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Exporta o catálogo técnico como planilha CSV (abre direto no Excel).
 * Padrão: só os modelos publicados. `?incluir=todos` (somente admin logado)
 * inclui também os modelos em verificação.
 */
export async function GET(req: Request) {
  let incluirTodos = new URL(req.url).searchParams.get("incluir") === "todos";
  if (incluirTodos) {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) incluirTodos = false;
  }

  const veiculos = (await buscarVeiculos())
    .filter((v) => incluirTodos || v.completude?.publicavel)
    .sort((a, b) => a.marca.localeCompare(b.marca) || a.nomeComercial.localeCompare(b.nomeComercial));

  const linhas = [
    COLUNAS.map(([titulo]) => celula(titulo)).join(";"),
    ...veiculos.map((v) => COLUNAS.map(([, valor]) => celula(valor(v))).join(";")),
  ];
  const hoje = new Date().toISOString().slice(0, 10);
  const nome = `catalogo-tecnico-${incluirTodos ? "completo" : "publicados"}-${hoje}.csv`;

  // BOM para o Excel reconhecer UTF-8 (acentos)
  return new Response("﻿" + linhas.join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${nome}"`,
    },
  });
}
