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
  /** Modelos publicados (pacote mínimo completo) */
  qtdModelos?: number;
  /** Modelos cadastrados ainda com pendências obrigatórias */
  qtdEmVerificacao?: number;
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
  /** Checklist do pacote mínimo de informações (preenchido pelos loaders). */
  completude?: Completude;
  /** Dados técnicos com fonte (preenchido pelos loaders). */
  tecnicos?: DadosTecnicos;
  criadoEm?: string;
  atualizadoEm?: string;
};

/** Estados padronizados de conectividade (CarPlay / Android Auto). */
export type EstadoConectividade =
  | "confirmado"
  | "nao_disponivel"
  | "nao_identificado"
  | "depende_versao";

/** Campos de rastreabilidade comuns a todo dado técnico. */
export type Rastreio = {
  evidencia: string | null;
  fonteUrl: string;
  consultadoEm: string;
  confianca: NivelConfianca;
};

export type FichaTecnica = Rastreio & {
  versaoReferencia: string | null;
  motor: string | null;
  potencia: string | null;
  torque: string | null;
  cambio: string | null;
  tracao: string | null;
  bateria: string | null;
  autonomia: string | null;
};

export type Multimidia = Rastreio & {
  telaPolegadas: string | null;
  sistema: string | null;
  carplay: EstadoConectividade;
  androidAuto: EstadoConectividade;
  carplayCabo: EstadoConectividade;
  carplaySemFio: EstadoConectividade;
  androidAutoCabo: EstadoConectividade;
  androidAutoSemFio: EstadoConectividade;
  observacoes: string | null;
};

export type ItemIluminacao = Rastreio & {
  posicao: string;
  tecnologia: string | null;
  codigo: string | null;
  potencia: string | null;
  oem: string | null;
  versoes: string | null;
};

export type Palheta = Rastreio & {
  posicao: string;
  medidaMm: number | null;
  medidaPol: number | null;
  encaixe: string | null;
  oem: string | null;
};

export type InterruptorVidro = Rastreio & {
  posicao: string;
  tipo: string | null;
  oem: string | null;
  pinos: number | null;
  conector: string | null;
};

export type DadosTecnicos = {
  ficha: FichaTecnica | null;
  multimidia: Multimidia | null;
  iluminacao: ItemIluminacao[];
  palhetas: Palheta[];
  interruptores: InterruptorVidro[];
};

export type ItemChecklist = {
  chave: string;
  rotulo: string;
  ok: boolean;
};

export type Completude = {
  publicavel: boolean;
  obrigatorios: ItemChecklist[];
  complementares: ItemChecklist[];
};
