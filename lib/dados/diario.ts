import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export type NumeroDiario = { rotulo: string; valor: number | string; detalhe?: string };

export type EntradaDiario = {
  id: string;
  realizadoEm: string;
  tipo: "rotina" | "monitoramento" | "vendas" | "pesquisa" | "manual";
  titulo: string;
  resumo: string;
  buscou: string[];
  encontrou: string[];
  numeros: NumeroDiario[];
  pendencias: string[];
  fontes: string[];
};

/** Registros do Diário de Bordo, do mais recente ao mais antigo. */
export async function buscarDiario(limite = 60): Promise<EntradaDiario[]> {
  const supabase = await criarClienteSupabaseServidor();
  const { data, error } = await supabase
    .from("diario_bordo")
    .select("*")
    .order("realizado_em", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    realizadoEm: r.realizado_em,
    tipo: r.tipo,
    titulo: r.titulo,
    resumo: r.resumo,
    buscou: r.buscou ?? [],
    encontrou: r.encontrou ?? [],
    numeros: Array.isArray(r.numeros) ? r.numeros : [],
    pendencias: r.pendencias ?? [],
    fontes: r.fontes ?? [],
  }));
}

export type AtividadeDia = { dia: string; areas: Record<string, number>; total: number };

/** Quantos registros de cada área foram gravados por dia (calculado direto do banco). */
export async function buscarAtividade(dias = 45): Promise<AtividadeDia[]> {
  const supabase = await criarClienteSupabaseServidor();
  const desde = new Date(Date.now() - dias * 86_400_000).toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("atividade_diaria")
    .select("dia, area, registros")
    .gte("dia", desde)
    .order("dia", { ascending: false });
  if (error) throw error;
  const porDia = new Map<string, AtividadeDia>();
  for (const r of (data ?? []) as { dia: string; area: string; registros: number }[]) {
    const d: AtividadeDia = porDia.get(r.dia) ?? { dia: r.dia, areas: {}, total: 0 };
    d.areas[r.area] = r.registros;
    d.total += r.registros;
    porDia.set(r.dia, d);
  }
  return [...porDia.values()];
}
