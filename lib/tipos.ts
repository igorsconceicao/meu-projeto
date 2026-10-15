// Tipos centrais da plataforma — compartilhados entre banco (Supabase) e UI.
// Em snake_case no PostgreSQL, mapeados para camelCase aqui.

export type NivelConfianca = "confirmado" | "bem_fundamentado" | "nao_confirmado";

export type CategoriaVeiculo =
  | "Hatch"
  | "Sedã"
  | "SUV"
  | "Picape"
  | "Utilitário"
  | "Esportivo"
  | "Minivan"
  | "Coupé";

export type TipoPropulsao =
  | "Combustão"
  | "Flex"
  | "Híbrido"
  | "Híbrido Plug-in"
  | "Elétrico";

export type SituacaoVeiculo =
  | "Lançado"
  | "Pré-venda"
  | "Atualizado"
  | "A confirmar"
  | "Descontinuado";

export type Montadora = {
  id: string;
  slug: string;
  nome: string;
  grupo: string | null;
  pais: string;
  destaque: string | null;
  logotipoUrl: string | null;
  logotipoCredito: string | null;
  siteOficialUrl: string | null;
  qtdModelos?: number;
  criadoEm?: string;
  atualizadoEm?: string;
};

export type Veiculo = {
  id: string;
  slug: string;
  montadoraId: string;
  /** Convenience: slug da montadora (derivado do join) */
  montadoraSlug: string;
  montadora?: Pick<
    Montadora,
    "slug" | "nome" | "logotipoUrl" | "siteOficialUrl"
  >;
  nomeComercial: string;
  /** Convenience: nome da marca (derivado do join) */
  marca: string;
  geracao: string;
  anoModelo: number | null;
  dataLancamentoBr: string | null;
  categoria: CategoriaVeiculo;
  propulsao: TipoPropulsao;
  precoReferencia: number | null;
  situacao: SituacaoVeiculo;
  confianca: NivelConfianca;
  resumo: string | null;
  fotoPrincipalUrl: string | null;
  fotoPrincipalCredito: string | null;
  fotoPrincipalFonteUrl: string | null;
  /** Página oficial brasileira onde a comercialização no Brasil foi confirmada */
  verificadoBrUrl: string | null;
  verificadoBrEm: string | null;
  galeriaUrls: string[];
  linkOficialUrl: string | null;
  videoOficialUrl: string | null;
  criadoEm?: string;
  atualizadoEm?: string;
};
