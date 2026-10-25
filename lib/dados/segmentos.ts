import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { Emplacamento } from "@/lib/dados/emplacamentos";

/** Segmentos com o nome que o importador grava; linhas com outro nome são ignoradas. */
export const SEGMENTOS_FENABRAVE = [
  "Veículos de Entrada",
  "Hatch Pequenos",
  "Hatch Médios",
  "Sedans Pequenos",
  "Sedans Compactos",
  "Sedans Médios",
  "Sedans Grandes",
  "SW Médios",
  "SW Grandes",
  "Monocab",
  "Grandcab",
  "Sports",
  "SUVs",
  "Picapes Pequenas",
  "Picapes Médias",
  "Picapes Grandes",
  "Furgões Pequenos",
  "Furgões",
] as const;

export const PREMIUM_MODELOS = "Premium — modelos";
export const PREMIUM_MARCAS = "Premium — marcas";

export type LinhaSegmento = Emplacamento & {
  fonte: "fenabrave" | "bright_consulting";
  /** Segmento como a fonte publica ("SUVs", "Hatch Pequenos", "Premium — modelos"...). */
  segmentoFonte: string;
  unidadesMesAnterior: number | null;
  acumuladoAno: number | null;
  participacao: number | null;
};

export type ParticipacaoSegmento = {
  segmento: string;
  mes: number;
  mesAnterior: number | null;
  fonteUrl: string;
};

type Linha = {
  periodo: string;
  fonte: LinhaSegmento["fonte"];
  grupo: string;
  segmento: string;
  posicao: number;
  marca: string;
  modelo: string;
  unidades: number;
  unidades_mes_anterior: number | null;
  acumulado_ano: number | null;
  participacao: number | null;
  fonte_url: string;
  edicao: string | null;
};

/** Rankings por segmento (Fenabrave) e premium (Bright Consulting) do mês mais recente. */
export async function buscarSegmentos(): Promise<{
  periodo: string | null;
  linhas: LinhaSegmento[];
  participacao: ParticipacaoSegmento[];
}> {
  const supabase = await criarClienteSupabaseServidor();
  const validos = [...SEGMENTOS_FENABRAVE, PREMIUM_MODELOS, PREMIUM_MARCAS];
  const { data: ultimo, error: e1 } = await supabase
    .from("emplacamentos_segmentos")
    .select("periodo")
    .order("periodo", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (e1) throw e1;
  const periodo = (ultimo as { periodo: string } | null)?.periodo ?? null;
  if (!periodo) return { periodo: null, linhas: [], participacao: [] };

  const [linhas, part] = await Promise.all([
    supabase
      .from("emplacamentos_segmentos")
      .select("periodo, fonte, grupo, segmento, posicao, marca, modelo, unidades, unidades_mes_anterior, acumulado_ano, participacao, fonte_url, edicao")
      .eq("periodo", periodo)
      .in("segmento", validos),
    supabase
      .from("participacao_segmentos")
      .select("segmento, participacao_mes, participacao_mes_anterior, fonte_url")
      .eq("periodo", periodo)
      .in("segmento", validos),
  ]);
  if (linhas.error) throw linhas.error;
  if (part.error) throw part.error;

  return {
    periodo,
    linhas: ((linhas.data ?? []) as Linha[]).map((r) => ({
      periodo: r.periodo,
      tipo: "mensal" as const,
      segmento: r.grupo === "Comerciais leves" ? ("Comerciais leves" as const) : ("Automóveis" as const),
      posicao: r.posicao,
      marca: r.marca,
      modelo: r.modelo,
      unidades: r.unidades,
      fonteUrl: r.fonte_url,
      edicao: r.edicao,
      fonte: r.fonte,
      unidadesMesAnterior: r.unidades_mes_anterior,
      acumuladoAno: r.acumulado_ano,
      participacao: r.participacao === null ? null : Number(r.participacao),
      segmentoFonte: r.segmento,
    })),
    participacao: (
      (part.data ?? []) as { segmento: string; participacao_mes: number; participacao_mes_anterior: number | null; fonte_url: string }[]
    ).map((p) => ({ segmento: p.segmento, mes: Number(p.participacao_mes), mesAnterior: p.participacao_mes_anterior === null ? null : Number(p.participacao_mes_anterior), fonteUrl: p.fonte_url })),
  };
}
