import { normalizar } from "@/lib/busca";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { Veiculo } from "@/lib/tipos";

export type Emplacamento = {
  periodo: string;
  tipo: "mensal" | "acumulado";
  segmento: "Automóveis" | "Comerciais leves";
  posicao: number;
  marca: string;
  modelo: string;
  unidades: number;
  fonteUrl: string;
  edicao: string | null;
};

type Linha = {
  periodo: string;
  tipo: Emplacamento["tipo"];
  segmento: Emplacamento["segmento"];
  posicao: number;
  marca: string;
  modelo: string;
  unidades: number;
  fonte_url: string;
  edicao: string | null;
};

export async function buscarEmplacamentos(): Promise<Emplacamento[]> {
  const supabase = await criarClienteSupabaseServidor();
  const { data, error } = await supabase
    .from("emplacamentos")
    .select("periodo, tipo, segmento, posicao, marca, modelo, unidades, fonte_url, edicao")
    .order("periodo", { ascending: false })
    .order("posicao");
  if (error) throw error;
  return ((data ?? []) as Linha[]).map((r) => ({
    periodo: r.periodo,
    tipo: r.tipo,
    segmento: r.segmento,
    posicao: r.posicao,
    marca: r.marca,
    modelo: r.modelo,
    unidades: r.unidades,
    fonteUrl: r.fonte_url,
    edicao: r.edicao,
  }));
}

// Nome da marca no informativo da Fenabrave → slugs das montadoras no catálogo
const MARCA_FENABRAVE: Record<string, string[]> = {
  VW: ["volkswagen"],
  GM: ["chevrolet"],
  "CAOA CHERY": ["chery"],
  "OMODA JAECOO": ["omoda", "jaecoo"],
  CITROEN: ["citroen"],
};

function slugsMarca(marca: string): string[] {
  return MARCA_FENABRAVE[marca] ?? [normalizar(marca).replace(/[^a-z0-9]/g, "")];
}

function palavras(s: string): string[] {
  return normalizar(s).split(/[^a-z0-9]+/).filter(Boolean);
}

// Sufixos que indicam só a motorização da mesma família (ex.: "Jaecoo 7" →
// "Jaecoo 7 SHS-P"). Qualquer outra palavra extra é outro modelo
// ("Corolla" ≠ "Corolla Cross", "Tiggo 7" ≠ "Tiggo 7 Pro").
const QUALIFICADORES = new Set(["shs", "h", "p", "em", "i", "plug", "in", "hybrid", "hibrido", "flex", "hev", "phev"]);

/** Nome do catálogo com e sem a marca na frente ("GAC Aion UT" → "Aion UT"). */
function formasDoNome(v: Veiculo): string[][] {
  const nome = palavras(v.nomeComercial);
  const marca = new Set([...palavras(v.marca), ...palavras(v.montadoraSlug)]);
  let i = 0;
  while (i < nome.length - 1 && marca.has(nome[i])) i++;
  return i ? [nome, nome.slice(i)] : [nome];
}

function comparar(modelo: string[], nome: string[]): "igual" | "variante" | null {
  if (nome.length < modelo.length || !modelo.every((p, i) => nome[i] === p)) return null;
  const resto = nome.slice(modelo.length);
  if (!resto.length) return "igual";
  return resto.every((p) => QUALIFICADORES.has(p)) ? "variante" : null;
}

/**
 * Liga cada modelo do ranking ao veículo do catálogo: nome igual (com ou sem a
 * marca na frente) ou, havendo um único candidato, a mesma família com sufixo
 * de motorização. Nunca liga por aproximação ambígua.
 */
export function ligarAoCatalogo(ranking: Emplacamento[], veiculos: Veiculo[]) {
  const porMarca = new Map<string, Veiculo[]>();
  for (const v of veiculos) {
    porMarca.set(v.montadoraSlug, [...(porMarca.get(v.montadoraSlug) ?? []), v]);
  }
  return ranking.map((e) => {
    const slugs = slugsMarca(e.marca).filter((s) => porMarca.has(s));
    const candidatos = slugs.flatMap((s) => porMarca.get(s) ?? []);
    const modelo = palavras(e.modelo);
    const resultado = (v: Veiculo) => {
      const r = formasDoNome(v).map((n) => comparar(modelo, n));
      return r.includes("igual") ? "igual" : r.includes("variante") ? "variante" : null;
    };
    const iguais = candidatos.filter((v) => resultado(v) === "igual");
    const variantes = candidatos.filter((v) => resultado(v) === "variante");
    const veiculo = iguais.length === 1 ? iguais[0] : iguais.length === 0 && variantes.length === 1 ? variantes[0] : undefined;
    // "familia": a Fenabrave soma todas as versões; o catálogo tem só esta variante.
    const ligacao = veiculo ? (iguais.length === 1 ? "igual" : "familia") : null;
    return { ...e, veiculo, ligacao, montadoraSlug: veiculo?.montadoraSlug ?? slugs[0] };
  });
}
