import { avaliarCompletude } from "@/lib/completude";
import { buscarDadosTecnicos, dadosTecnicosVazios } from "@/lib/dados/tecnicos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { DadosTecnicos, Veiculo } from "@/lib/tipos";

type VeiculoRow = {
  id: string;
  slug: string;
  montadora_id: string;
  nome_comercial: string;
  geracao: string;
  ano_modelo: number | null;
  data_lancamento_br: string | null;
  categoria: Veiculo["categoria"];
  propulsao: Veiculo["propulsao"];
  preco_referencia: string | null;
  situacao: Veiculo["situacao"];
  confianca: Veiculo["confianca"];
  resumo: string | null;
  foto_principal_url: string | null;
  foto_principal_credito: string | null;
  foto_principal_fonte_url: string | null;
  verificado_br_url: string | null;
  verificado_br_em: string | null;
  galeria_urls: string[] | null;
  link_oficial_url: string | null;
  video_oficial_url: string | null;
  criado_em: string;
  atualizado_em: string;
  montadora?: {
    slug: string;
    nome: string;
    logotipo_url: string | null;
    site_oficial_url: string | null;
  } | null;
};

function mapearVeiculo(row: VeiculoRow): Veiculo {
  return {
    id: row.id,
    slug: row.slug,
    montadoraId: row.montadora_id,
    montadoraSlug: row.montadora?.slug ?? "",
    montadora: row.montadora
      ? {
          slug: row.montadora.slug,
          nome: row.montadora.nome,
          logotipoUrl: row.montadora.logotipo_url,
          siteOficialUrl: row.montadora.site_oficial_url,
        }
      : undefined,
    marca: row.montadora?.nome ?? "",
    nomeComercial: row.nome_comercial,
    geracao: row.geracao,
    anoModelo: row.ano_modelo,
    dataLancamentoBr: row.data_lancamento_br,
    categoria: row.categoria,
    propulsao: row.propulsao,
    precoReferencia: row.preco_referencia ? Number(row.preco_referencia) : null,
    situacao: row.situacao,
    confianca: row.confianca,
    resumo: row.resumo,
    fotoPrincipalUrl: row.foto_principal_url,
    fotoPrincipalCredito: row.foto_principal_credito,
    fotoPrincipalFonteUrl: row.foto_principal_fonte_url,
    verificadoBrUrl: row.verificado_br_url,
    verificadoBrEm: row.verificado_br_em,
    galeriaUrls: row.galeria_urls ?? [],
    linkOficialUrl: row.link_oficial_url,
    videoOficialUrl: row.video_oficial_url,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

const SELECT_COM_MONTADORA = `
  *,
  montadora:montadoras!veiculos_montadora_id_fkey(
    slug, nome, logotipo_url, site_oficial_url
  )
`;

/** Todos os veículos (inclusive em verificação), com o checklist de completude. */
export async function buscarVeiculos(): Promise<Veiculo[]> {
  const supabase = await criarClienteSupabaseServidor();
  const [{ data, error }, tecnicos] = await Promise.all([
    supabase
      .from("veiculos")
      .select(SELECT_COM_MONTADORA)
      .order("ano_modelo", { ascending: false, nullsFirst: false })
      .order("data_lancamento_br", { ascending: false, nullsFirst: false })
      .order("nome_comercial"),
    buscarDadosTecnicos(),
  ]);
  if (error) throw error;
  return ((data as unknown as VeiculoRow[]) ?? []).map((row) => {
    const v = mapearVeiculo(row);
    v.tecnicos = tecnicos.get(v.id) ?? dadosTecnicosVazios();
    v.completude = avaliarCompletude(v, v.tecnicos);
    return v;
  });
}

/** Só os veículos com o pacote mínimo completo — usados nas páginas públicas. */
export async function buscarVeiculosPublicados(): Promise<Veiculo[]> {
  return (await buscarVeiculos()).filter((v) => v.completude?.publicavel);
}

export async function buscarVeiculoPorSlug(
  slug: string,
): Promise<{ veiculo: Veiculo; tecnicos: DadosTecnicos } | null> {
  const supabase = await criarClienteSupabaseServidor();
  const { data, error } = await supabase
    .from("veiculos")
    .select(SELECT_COM_MONTADORA)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const veiculo = mapearVeiculo(data as unknown as VeiculoRow);
  const tecnicos =
    (await buscarDadosTecnicos(veiculo.id)).get(veiculo.id) ?? dadosTecnicosVazios();
  veiculo.tecnicos = tecnicos;
  veiculo.completude = avaliarCompletude(veiculo, tecnicos);
  return { veiculo, tecnicos };
}

export async function listarSlugsDeVeiculos(): Promise<string[]> {
  const supabase = await criarClienteSupabaseServidor();
  const { data, error } = await supabase.from("veiculos").select("slug");
  if (error) throw error;
  return (data ?? []).map((r) => (r as { slug: string }).slug);
}
