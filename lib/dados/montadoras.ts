import { cache } from "react";
import { exigirSessao } from "@/lib/auth/sessao";
import { lerCatalogo } from "@/lib/dados/catalogo";
import { buscarVeiculos } from "@/lib/dados/veiculos";
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

/** Marcas em ordem alfabética, com a contagem de modelos (do catálogo em cache). */
export const buscarMontadoras = cache(async function buscarMontadoras(): Promise<Montadora[]> {
  await exigirSessao();
  const [catalogo, veiculos] = await Promise.all([lerCatalogo(), buscarVeiculos()]);

  // Contagem por montadora: publicados (pacote mínimo completo) × em verificação
  const publicados = new Map<string, number>();
  const emVerificacao = new Map<string, number>();
  for (const v of veiculos) {
    const alvo = v.completude?.publicavel ? publicados : emVerificacao;
    alvo.set(v.montadoraId, (alvo.get(v.montadoraId) ?? 0) + 1);
  }

  return (catalogo.montadoras as unknown as MontadoraRow[]).map((m) =>
    mapearMontadora(m, publicados.get(m.id) ?? 0, emVerificacao.get(m.id) ?? 0),
  );
});
