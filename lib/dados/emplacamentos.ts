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

// Nome da marca no informativo da Fenabrave → slug da montadora no catálogo
const MARCA_FENABRAVE: Record<string, string> = {
  VW: "volkswagen",
  GM: "chevrolet",
  "CAOA CHERY": "chery",
  CITROEN: "citroen",
};

function slugMarca(marca: string): string {
  return MARCA_FENABRAVE[marca] ?? normalizar(marca).replace(/[^a-z0-9]/g, "");
}

function chave(s: string): string {
  return normalizar(s).replace(/[^a-z0-9]/g, "");
}

/**
 * Liga cada modelo do ranking ao veículo do catálogo: nome igual, ou o nome do
 * catálogo começando pelo nome do ranking (ex.: "SONG PRO" → "Song Pro Flex")
 * quando houver um único candidato. Nunca liga por aproximação ambígua.
 */
export function ligarAoCatalogo(ranking: Emplacamento[], veiculos: Veiculo[]) {
  const porMarca = new Map<string, Veiculo[]>();
  for (const v of veiculos) {
    porMarca.set(v.montadoraSlug, [...(porMarca.get(v.montadoraSlug) ?? []), v]);
  }
  return ranking.map((e) => {
    const candidatos = porMarca.get(slugMarca(e.marca)) ?? [];
    const k = chave(e.modelo);
    const iguais = candidatos.filter((v) => chave(v.nomeComercial) === k);
    const prefixo = candidatos.filter((v) => chave(v.nomeComercial).startsWith(k));
    const veiculo = iguais.length === 1 ? iguais[0] : iguais.length === 0 && prefixo.length === 1 ? prefixo[0] : undefined;
    return { ...e, veiculo, montadoraSlug: candidatos.length ? slugMarca(e.marca) : undefined };
  });
}
