/**
 * ============================================================================
 * DADOS DE DEMONSTRAÇÃO (dados técnicos ainda não migrados para o banco)
 * ============================================================================
 * Após a Iteração 2, montadoras e veículos vêm do Supabase (ver `lib/dados/`).
 * Este arquivo mantém apenas os dados técnicos e analíticos que ainda não
 * foram modelados no banco — serão migrados nas próximas iterações:
 *   - MULTIMIDIAS, LAMPADAS, PALHETAS, INTERRUPTORES, CODIGOS_OEM → Iteração 4
 *   - VENDAS, OPINIOES, ACESSORIOS → Iterações 8-9
 *   - OPORTUNIDADES → Iteração 10
 *   - RELATORIOS → Iteração 12
 *
 * Todos os registros aqui têm `demo: true`. Nenhum é apresentado como
 * dado real do mercado automotivo até ter sido coletado de fonte oficial.
 * ============================================================================
 */

// Re-exporta os tipos canônicos para compatibilidade com código anterior
export type { Montadora, Veiculo, NivelConfianca } from "./tipos";

export const AVISO_DEMO =
  "Dados fictícios de demonstração — não representam o mercado real.";

export type Multimidia = {
  demo: true;
  veiculoSlug: string;
  fabricante: string;
  modeloEquipamento: string;
  tamanhoTela: string;
  resolucao: string;
  so: string;
  carplayCabo: EstadoRecurso;
  carplaySemFio: EstadoRecurso;
  androidAutoCabo: EstadoRecurso;
  androidAutoSemFio: EstadoRecurso;
  bluetooth: EstadoRecurso;
  wifi: EstadoRecurso;
  gpsNativo: EstadoRecurso;
  portasUsb: string;
  altoFalantes: string;
  confianca: import("./tipos").NivelConfianca;
  observacoes: string;
};

export type EstadoRecurso =
  | "confirmado"
  | "nao_disponivel"
  | "nao_identificado"
  | "depende_versao";

export const MULTIMIDIAS: Multimidia[] = [];

export type Lampada = {
  demo: true;
  veiculoSlug: string;
  posicao: string;
  codigo: string;
  tecnologia: "Halógena" | "LED" | "Xenônio" | "Mista";
  potencia: string;
  oem: string;
  confianca: import("./tipos").NivelConfianca;
};

export const LAMPADAS: Lampada[] = [];

export type Palheta = {
  demo: true;
  veiculoSlug: string;
  posicao: "Motorista" | "Passageiro" | "Traseira";
  medidaMm: number;
  medidaPol: string;
  encaixe: string;
  formato: "Convencional" | "Flat" | "Híbrida";
  oem: string;
  confianca: import("./tipos").NivelConfianca;
};

export const PALHETAS: Palheta[] = [];

export type Interruptor = {
  demo: true;
  veiculoSlug: string;
  tipo: string;
  pinos: number;
  conector: string;
  iluminado: boolean;
  oem: string;
  confianca: import("./tipos").NivelConfianca;
};

export const INTERRUPTORES: Interruptor[] = [];

export type CodigoOem = {
  demo: true;
  codigo: string;
  descricao: string;
  categoria: string;
  fabricanteOriginal?: string;
  aplicacoes: string[];
  substituido?: string;
  confianca: import("./tipos").NivelConfianca;
};

export const CODIGOS_OEM: CodigoOem[] = [];

export type VendaMensal = {
  demo: true;
  mesReferencia: string;
  marca: string;
  modelo: string;
  categoria: string;
  emplacamentos: number;
  variacaoMensal: number;
  participacao: number;
};

export const VENDAS: VendaMensal[] = [
  {
    demo: true,
    mesReferencia: "2026-09",
    marca: "ExemploMotors",
    modelo: "Rally Picape",
    categoria: "Picape",
    emplacamentos: 4321,
    variacaoMensal: 0.082,
    participacao: 0.021,
  },
  {
    demo: true,
    mesReferencia: "2026-09",
    marca: "Placeholder Cars",
    modelo: "Aurora Sedã",
    categoria: "Sedã",
    emplacamentos: 2890,
    variacaoMensal: -0.034,
    participacao: 0.014,
  },
  {
    demo: true,
    mesReferencia: "2026-09",
    marca: "Demo Auto",
    modelo: "Vector",
    categoria: "SUV",
    emplacamentos: 1512,
    variacaoMensal: 0.231,
    participacao: 0.008,
  },
];

export type OportunidadeInovacao = {
  demo: true;
  slug: string;
  titulo: string;
  descricao: string;
  veiculoAlvo: string;
  categoria: string;
  prioridade: "Alta" | "Média" | "Baixa";
  evidencias: number;
  pendencias: string[];
};

export const OPORTUNIDADES: OportunidadeInovacao[] = [
  {
    demo: true,
    slug: "adaptador-carplay-sem-fio-aurora",
    titulo: "Adaptador CarPlay sem fio (modelo de exemplo)",
    descricao:
      "Oportunidades reais serão geradas a partir da coleta automática (Iteração 10) cruzando reclamações, lançamentos e lacunas de catálogo.",
    veiculoAlvo: "A confirmar",
    categoria: "Multimídia e conectividade",
    prioridade: "Alta",
    evidencias: 0,
    pendencias: [
      "Coleta real de fontes (Iteração 6)",
      "Pipeline de oportunidades (Iteração 10)",
    ],
  },
];

export type FatoRelatorio = {
  demo: true;
  tipo: "Lançamento" | "Atualização" | "Mudança técnica" | "Oportunidade";
  titulo: string;
  resumo: string;
};

export type RelatorioSemanal = {
  demo: true;
  semana: string;
  dataGeracao: string;
  totalNovidades: number;
  totalOportunidades: number;
  fatos: FatoRelatorio[];
};

export const RELATORIOS: RelatorioSemanal[] = [
  {
    demo: true,
    semana: "2026-W41",
    dataGeracao: "2026-10-13",
    totalNovidades: 12,
    totalOportunidades: 3,
    fatos: [
      {
        demo: true,
        tipo: "Lançamento",
        titulo: "Exemplo de fato — a plataforma vai preencher este bloco",
        resumo:
          "Relatórios reais serão gerados automaticamente a partir da Iteração 11.",
      },
    ],
  },
];

export type Acessorio = {
  demo: true;
  nome: string;
  categoria: string;
  veiculosAlvo: string[];
  evidenciasDemanda: number;
  concorrentes: number;
  observacao: string;
};

export const ACESSORIOS: Acessorio[] = [
  {
    demo: true,
    nome: "Adaptador CarPlay sem fio universal",
    categoria: "Multimídia",
    veiculosAlvo: ["Modelo de exemplo"],
    evidenciasDemanda: 0,
    concorrentes: 0,
    observacao:
      "Lista real será preenchida pela coleta automática (Iteração 9).",
  },
];

export type Opiniao = {
  demo: true;
  tema: string;
  veiculo: string;
  recorrencia: number;
  periodo: string;
  sentimento: "positivo" | "negativo" | "misto";
  resumo: string;
};

export const OPINIOES: Opiniao[] = [
  {
    demo: true,
    tema: "Exemplo de opinião recorrente",
    veiculo: "Modelo de exemplo",
    recorrencia: 0,
    periodo: "últimos 30 dias",
    sentimento: "misto",
    resumo:
      "Opiniões reais virão de Reddit, YouTube e fóruns a partir da Iteração 9.",
  },
];

export const RESUMO_DASHBOARD = {
  demo: true,
  ultimaExecucao: "2026-10-13T09:12:00-03:00",
  statusExecucao: "sucesso" as const,
  novidadesSemana: 0, // calculado dinamicamente a partir do banco agora
  tokensUtilizadosSemana: 0,
  custoEstimadoSemanaUsd: 0,
};
