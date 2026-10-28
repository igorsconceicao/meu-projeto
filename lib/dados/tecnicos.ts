import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type {
  DadosTecnicos,
  FichaTecnica,
  InterruptorVidro,
  ItemIluminacao,
  LinhaVersoes,
  Multimidia,
  Palheta,
  Rastreio,
  Versao,
} from "@/lib/tipos";

type Linha = Record<string, unknown> & { veiculo_id: string };

const TABELAS = [
  "fichas_tecnicas",
  "multimidias",
  "iluminacao",
  "palhetas",
  "interruptores_vidro",
  "versoes",
  "linhas_versoes",
] as const;

// O PostgREST do Supabase devolve no máximo 1000 linhas por pedido.
const PAGINA = 1000;
// Coluna única de cada tabela, para a paginação não pular nem repetir linhas.
const CHAVE: Record<(typeof TABELAS)[number], string> = {
  fichas_tecnicas: "veiculo_id",
  multimidias: "veiculo_id",
  iluminacao: "id",
  palhetas: "id",
  interruptores_vidro: "id",
  versoes: "id",
  linhas_versoes: "veiculo_id",
};

function txt(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function rastreio(r: Linha): Rastreio {
  return {
    evidencia: txt(r.evidencia),
    fonteUrl: String(r.fonte_url),
    consultadoEm: String(r.consultado_em),
    confianca: r.confianca as Rastreio["confianca"],
  };
}

function mapearFicha(r: Linha): FichaTecnica {
  return {
    ...rastreio(r),
    versaoReferencia: txt(r.versao_referencia),
    motor: txt(r.motor),
    potencia: txt(r.potencia),
    torque: txt(r.torque),
    cambio: txt(r.cambio),
    tracao: txt(r.tracao),
    bateria: txt(r.bateria),
    autonomia: txt(r.autonomia),
  };
}

function mapearMultimidia(r: Linha): Multimidia {
  return {
    ...rastreio(r),
    telaPolegadas: txt(r.tela_polegadas),
    sistema: txt(r.sistema),
    carplay: r.carplay as Multimidia["carplay"],
    androidAuto: r.android_auto as Multimidia["androidAuto"],
    carplayCabo: r.carplay_cabo as Multimidia["carplayCabo"],
    carplaySemFio: r.carplay_sem_fio as Multimidia["carplaySemFio"],
    androidAutoCabo: r.android_auto_cabo as Multimidia["androidAutoCabo"],
    androidAutoSemFio: r.android_auto_sem_fio as Multimidia["androidAutoSemFio"],
    observacoes: txt(r.observacoes),
  };
}

function mapearIluminacao(r: Linha): ItemIluminacao {
  return {
    ...rastreio(r),
    posicao: String(r.posicao),
    tecnologia: txt(r.tecnologia),
    codigo: txt(r.codigo),
    potencia: txt(r.potencia),
    oem: txt(r.oem),
    versoes: txt(r.versoes),
  };
}

function mapearPalheta(r: Linha): Palheta {
  return {
    ...rastreio(r),
    posicao: String(r.posicao),
    medidaMm: num(r.medida_mm),
    medidaPol: num(r.medida_pol),
    encaixe: txt(r.encaixe),
    oem: txt(r.oem),
  };
}

function mapearInterruptor(r: Linha): InterruptorVidro {
  return {
    ...rastreio(r),
    posicao: String(r.posicao),
    tipo: txt(r.tipo),
    oem: txt(r.oem),
    pinos: num(r.pinos),
    conector: txt(r.conector),
  };
}

function mapearVersao(r: Linha): Versao {
  return {
    ...rastreio(r),
    ordem: Number(r.ordem),
    nome: String(r.nome),
    nomeCompleto: txt(r.nome_completo),
    posicionamento: txt(r.posicionamento),
    motor: txt(r.motor),
    cambio: txt(r.cambio),
    diferencial: txt(r.diferencial),
    itensAdicionais: Array.isArray(r.itens_adicionais) ? (r.itens_adicionais as string[]) : [],
    baseComparacao: txt(r.base_comparacao),
    multimidia: txt(r.multimidia),
    iluminacao: txt(r.iluminacao),
  };
}

function mapearLinhaVersoes(r: Linha): LinhaVersoes {
  return { ...rastreio(r), nomenclatura: txt(r.nomenclatura), observacoes: txt(r.observacoes) };
}

export function dadosTecnicosVazios(): DadosTecnicos {
  return {
    ficha: null,
    multimidia: null,
    iluminacao: [],
    palhetas: [],
    interruptores: [],
    versoes: [],
    linhaVersoes: null,
  };
}

// Ordem de exibição das posições de iluminação (as demais vão ao final).
const ORDEM_ILUMINACAO = [
  "farol principal",
  "farol baixo",
  "farol alto",
  "luz diurna",
  "farol de neblina",
  "lanterna",
];

function ordemIluminacao(posicao: string): number {
  const p = posicao.toLowerCase();
  const i = ORDEM_ILUMINACAO.findIndex((o) => p.startsWith(o));
  return i === -1 ? ORDEM_ILUMINACAO.length : i;
}

/**
 * Carrega os dados técnicos de um veículo (ou de todos, quando `veiculoId`
 * é omitido) e devolve um mapa veiculo_id → DadosTecnicos.
 */
export async function buscarDadosTecnicos(
  veiculoId?: string,
): Promise<Map<string, DadosTecnicos>> {
  const supabase = await criarClienteSupabaseServidor();
  const ler = async (tabela: (typeof TABELAS)[number]) => {
    const linhas: Linha[] = [];
    for (let de = 0; ; de += PAGINA) {
      let q = supabase.from(tabela).select("*");
      if (veiculoId) q = q.eq("veiculo_id", veiculoId);
      const { data, error } = await q.order(CHAVE[tabela]).range(de, de + PAGINA - 1);
      if (error) return { data: null, error };
      linhas.push(...((data ?? []) as Linha[]));
      if ((data ?? []).length < PAGINA) return { data: linhas, error: null };
    }
  };
  const resultados = await Promise.all(TABELAS.map(ler));

  const mapa = new Map<string, DadosTecnicos>();
  const obter = (id: string) => {
    let d = mapa.get(id);
    if (!d) {
      d = dadosTecnicosVazios();
      mapa.set(id, d);
    }
    return d;
  };

  resultados.forEach(({ data, error }, i) => {
    if (error) throw error;
    for (const r of (data ?? []) as Linha[]) {
      const d = obter(r.veiculo_id);
      switch (TABELAS[i]) {
        case "fichas_tecnicas":
          d.ficha = mapearFicha(r);
          break;
        case "multimidias":
          d.multimidia = mapearMultimidia(r);
          break;
        case "iluminacao":
          d.iluminacao.push(mapearIluminacao(r));
          break;
        case "palhetas":
          d.palhetas.push(mapearPalheta(r));
          break;
        case "interruptores_vidro":
          d.interruptores.push(mapearInterruptor(r));
          break;
        case "versoes":
          d.versoes.push(mapearVersao(r));
          break;
        case "linhas_versoes":
          d.linhaVersoes = mapearLinhaVersoes(r);
          break;
      }
    }
  });

  for (const d of mapa.values()) {
    d.iluminacao.sort((a, b) => ordemIluminacao(a.posicao) - ordemIluminacao(b.posicao));
    d.versoes.sort((a, b) => a.ordem - b.ordem);
  }
  return mapa;
}
