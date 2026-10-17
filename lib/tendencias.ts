// Tendências calculadas a partir de dados reais: ranking Fenabrave (mês a mês)
// e fichas técnicas publicadas. Nenhum número é estimado ou extrapolado.
import { projecaoSemFio, tipoFarol } from "@/lib/classificacao";
import { slugsMarca, type Emplacamento } from "@/lib/dados/emplacamentos";
import type { Montadora, Veiculo } from "@/lib/tipos";

export type Movimento = {
  segmento: Emplacamento["segmento"];
  nome: string;
  posicao: number;
  anterior: number | null;
  unidades: number;
  unidadesAntes: number | null;
};

const SEM_CADASTRO = "Marcas fora do catálogo";

/** Meses com ranking mensal, do mais antigo ao mais recente. */
export function mesesMensais(e: Emplacamento[]): string[] {
  return [...new Set(e.filter((x) => x.tipo === "mensal").map((x) => x.periodo))].sort();
}

/** Mudanças de posição entre os dois últimos meses (mesmo segmento). */
export function movimentos(e: Emplacamento[]) {
  const meses = mesesMensais(e);
  const [antes, agora] = meses.slice(-2);
  if (!agora || !antes) return { agora: agora ?? null, antes: null, subiram: [], cairam: [], entraram: [], sairam: [] };
  const chave = (x: Emplacamento) => `${x.segmento}|${x.marca}/${x.modelo}`;
  const mapaAntes = new Map(e.filter((x) => x.tipo === "mensal" && x.periodo === antes).map((x) => [chave(x), x]));
  const atuais = e.filter((x) => x.tipo === "mensal" && x.periodo === agora);
  const chavesAtuais = new Set(atuais.map(chave));

  const lista: Movimento[] = atuais.map((x) => {
    const a = mapaAntes.get(chave(x));
    return {
      segmento: x.segmento,
      nome: `${x.marca}/${x.modelo}`,
      posicao: x.posicao,
      anterior: a?.posicao ?? null,
      unidades: x.unidades,
      unidadesAntes: a?.unidades ?? null,
    };
  });
  const comAnterior = lista.filter((m) => m.anterior !== null);
  const sairam = [...mapaAntes.values()]
    .filter((x) => !chavesAtuais.has(chave(x)))
    .map((x) => ({ segmento: x.segmento, nome: `${x.marca}/${x.modelo}`, posicao: x.posicao, anterior: x.posicao, unidades: x.unidades, unidadesAntes: x.unidades }));

  return {
    agora,
    antes,
    subiram: comAnterior.filter((m) => m.anterior! > m.posicao).sort((a, b) => b.anterior! - b.posicao - (a.anterior! - a.posicao)).slice(0, 8),
    cairam: comAnterior.filter((m) => m.anterior! < m.posicao).sort((a, b) => b.posicao - b.anterior! - (a.posicao - a.anterior!)).slice(0, 8),
    entraram: lista.filter((m) => m.anterior === null).sort((a, b) => a.posicao - b.posicao),
    sairam: sairam.sort((a, b) => a.posicao - b.posicao),
  };
}

/**
 * Unidades por país de origem da marca em cada mês, somando os 50 modelos mais
 * emplacados de automóveis e de comerciais leves.
 */
export function participacaoPorOrigem(e: Emplacamento[], montadoras: Montadora[]) {
  const pais = new Map(montadoras.map((m) => [m.slug, m.pais]));
  const origem = (marca: string) => {
    for (const s of slugsMarca(marca)) if (pais.has(s)) return pais.get(s)!;
    return SEM_CADASTRO;
  };
  const meses = mesesMensais(e);
  const linhas = meses.map((mes) => {
    const porPais = new Map<string, number>();
    let total = 0;
    for (const x of e) {
      if (x.tipo !== "mensal" || x.periodo !== mes) continue;
      const p = origem(x.marca);
      porPais.set(p, (porPais.get(p) ?? 0) + x.unidades);
      total += x.unidades;
    }
    return { mes, total, porPais };
  });
  const paises = [...new Set(linhas.flatMap((l) => [...l.porPais.keys()]))].sort((a, b) => {
    if (a === SEM_CADASTRO) return 1;
    if (b === SEM_CADASTRO) return -1;
    const ultimo = linhas.at(-1)?.porPais;
    return (ultimo?.get(b) ?? 0) - (ultimo?.get(a) ?? 0);
  });
  return { meses, linhas, paises };
}

/** Variação de unidades por marca (soma dos modelos no top 50) entre os dois últimos meses. */
export function variacaoPorMarca(e: Emplacamento[]) {
  const meses = mesesMensais(e);
  const [antes, agora] = meses.slice(-2);
  if (!antes || !agora) return [];
  const somar = (mes: string) => {
    const m = new Map<string, number>();
    for (const x of e) if (x.tipo === "mensal" && x.periodo === mes) m.set(x.marca, (m.get(x.marca) ?? 0) + x.unidades);
    return m;
  };
  const a = somar(antes);
  const b = somar(agora);
  return [...b.entries()]
    .map(([marca, unidades]) => {
      const anterior = a.get(marca) ?? null;
      return { marca, unidades, anterior, variacao: anterior ? (unidades - anterior) / anterior : null };
    })
    .filter((x) => x.anterior !== null && x.anterior >= 1000)
    .sort((x, y) => (y.variacao ?? 0) - (x.variacao ?? 0));
}

/** Maior tela citada na fonte (ex.: '10,1" (GL) / 12,8" (GS)' → 12,8). */
export function maiorTela(texto: string | null | undefined): number | null {
  if (!texto) return null;
  const n = [...texto.matchAll(/(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:"|”|''|pol)/g)].map((m) => Number(m[1].replace(",", ".")));
  const validos = n.filter((x) => x >= 5 && x <= 20);
  return validos.length ? Math.max(...validos) : null;
}

/** Tecnologia dos modelos publicados, agrupada por origem da marca. */
export function tecnologiaPorOrigem(veiculos: Veiculo[], montadoras: Montadora[]) {
  const pais = new Map(montadoras.map((m) => [m.slug, m.pais]));
  const grupos = new Map<string, Veiculo[]>();
  for (const v of veiculos) {
    if (!v.completude?.publicavel) continue;
    const p = pais.get(v.montadoraSlug) ?? "Outros";
    grupos.set(p, [...(grupos.get(p) ?? []), v]);
  }
  const resumo = (lista: Veiculo[]) => {
    const telas = lista.map((v) => maiorTela(v.tecnicos?.multimidia?.telaPolegadas)).filter((x): x is number => x !== null);
    return {
      modelos: lista.length,
      semFio: lista.filter((v) => projecaoSemFio(v) !== "nenhuma").length,
      led: lista.filter((v) => tipoFarol(v) === "led").length,
      eletrificados: lista.filter((v) => v.propulsao !== "Flex" && v.propulsao !== "Combustão").length,
      telaMediana: telas.length ? [...telas].sort((a, b) => a - b)[Math.floor(telas.length / 2)] : null,
      telaGrande: telas.filter((t) => t >= 12).length,
    };
  };
  const linhas = [...grupos.entries()].map(([origem, lista]) => ({ origem, ...resumo(lista) })).sort((a, b) => b.modelos - a.modelos);
  const todos = veiculos.filter((v) => v.completude?.publicavel);
  return { linhas, total: { origem: "Todos", ...resumo(todos) } };
}
