import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { Montadora } from "@/lib/tipos";

type MontadoraRow = {
  id: string;
  slug: string;
  nome: string;
  grupo: string | null;
  pais: string;
  destaque: string | null;
  logotipo_url: string | null;
  logotipo_credito: string | null;
  site_oficial_url: string | null;
  criado_em: string;
  atualizado_em: string;
};

function mapearMontadora(row: MontadoraRow, qtdModelos?: number): Montadora {
  return {
    id: row.id,
    slug: row.slug,
    nome: row.nome,
    grupo: row.grupo,
    pais: row.pais,
    destaque: row.destaque,
    logotipoUrl: row.logotipo_url,
    logotipoCredito: row.logotipo_credito,
    siteOficialUrl: row.site_oficial_url,
    qtdModelos,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

export async function buscarMontadoras(): Promise<Montadora[]> {
  const supabase = await criarClienteSupabaseServidor();
  const { data: montadoras, error } = await supabase
    .from("montadoras")
    .select("*")
    .order("nome");
  if (error) throw error;

  // Contagem de modelos por montadora (query separada e barata)
  const { data: contagens } = await supabase
    .from("veiculos")
    .select("montadora_id");
  const porId = new Map<string, number>();
  for (const row of contagens ?? []) {
    const id = (row as { montadora_id: string }).montadora_id;
    porId.set(id, (porId.get(id) ?? 0) + 1);
  }

  return (montadoras ?? []).map((m) =>
    mapearMontadora(m as MontadoraRow, porId.get(m.id) ?? 0),
  );
}

export async function buscarMontadoraPorSlug(
  slug: string,
): Promise<Montadora | null> {
  const supabase = await criarClienteSupabaseServidor();
  const { data, error } = await supabase
    .from("montadoras")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapearMontadora(data as MontadoraRow) : null;
}
