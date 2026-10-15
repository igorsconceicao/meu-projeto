import { buscarVeiculos } from "@/lib/dados/veiculos";
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

function mapearMontadora(
  row: MontadoraRow,
  qtdModelos?: number,
  qtdEmVerificacao?: number,
): Montadora {
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
    qtdEmVerificacao,
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

  // Contagem por montadora: publicados (pacote mínimo completo) × em verificação
  const veiculos = await buscarVeiculos();
  const publicados = new Map<string, number>();
  const emVerificacao = new Map<string, number>();
  for (const v of veiculos) {
    const alvo = v.completude?.publicavel ? publicados : emVerificacao;
    alvo.set(v.montadoraId, (alvo.get(v.montadoraId) ?? 0) + 1);
  }

  return (montadoras ?? []).map((m) =>
    mapearMontadora(
      m as MontadoraRow,
      publicados.get(m.id) ?? 0,
      emVerificacao.get(m.id) ?? 0,
    ),
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
