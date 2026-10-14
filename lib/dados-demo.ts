/**
 * ============================================================================
 * DADOS DE DEMONSTRAÇÃO
 * ============================================================================
 * Todos os registros deste arquivo possuem `demo: true`.
 * NÃO representam informações reais do mercado automotivo brasileiro.
 * Serão substituídos pela coleta real a partir da Iteração 6.
 *
 * Nenhum código OEM, especificação, estatística ou aplicação exibida aqui
 * deve ser utilizado em decisões comerciais ou técnicas até ser confirmado
 * por fontes reais (regra 24.3 do briefing do projeto).
 * ============================================================================
 */

import type { NivelConfianca } from "@/components/ui/badge-confianca";

export const AVISO_DEMO =
  "Dados fictícios de demonstração — não representam o mercado real.";

export type Montadora = {
  demo: true;
  slug: string;
  nome: string;
  grupo?: string;
  pais: string;
  qtdModelos: number;
  destaque?: string;
};

export const MONTADORAS: Montadora[] = [
  {
    demo: true,
    slug: "exemplo-motors",
    nome: "ExemploMotors",
    grupo: "Grupo Demo",
    pais: "Brasil",
    qtdModelos: 7,
    destaque: "Lançamento de SUV elétrico em pré-venda (fictício)",
  },
  {
    demo: true,
    slug: "demo-auto",
    nome: "Demo Auto",
    grupo: "Grupo Demo Internacional",
    pais: "China",
    qtdModelos: 4,
    destaque: "Entrada no Brasil anunciada (fictício)",
  },
  {
    demo: true,
    slug: "placeholder-cars",
    nome: "Placeholder Cars",
    grupo: "Grupo Demo Europa",
    pais: "Alemanha",
    qtdModelos: 12,
    destaque: "Nova geração do sedã médio (fictício)",
  },
  {
    demo: true,
    slug: "exemplo-ev",
    nome: "ExemploEV",
    pais: "Brasil",
    qtdModelos: 3,
    destaque: "Hatch elétrico de entrada (fictício)",
  },
];

export type Veiculo = {
  demo: true;
  slug: string;
  nomeComercial: string;
  montadoraSlug: string;
  marca: string;
  geracao: string;
  anoModelo: number;
  dataLancamentoBr: string;
  categoria: "Hatch" | "Sedã" | "SUV" | "Picape" | "Utilitário" | "Esportivo";
  propulsao: "Combustão" | "Flex" | "Híbrido" | "Híbrido Plug-in" | "Elétrico";
  precoReferencia: number;
  situacao: "Lançado" | "Pré-venda" | "Atualizado" | "A confirmar";
  confianca: NivelConfianca;
  resumo: string;
};

export const VEICULOS: Veiculo[] = [
  {
    demo: true,
    slug: "exemplo-motors-horizon-suv-2026",
    nomeComercial: "Horizon SUV",
    montadoraSlug: "exemplo-motors",
    marca: "ExemploMotors",
    geracao: "1ª geração",
    anoModelo: 2026,
    dataLancamentoBr: "2026-02-15",
    categoria: "SUV",
    propulsao: "Híbrido Plug-in",
    precoReferencia: 289900,
    situacao: "Pré-venda",
    confianca: "nao_confirmado",
    resumo:
      "SUV médio híbrido plug-in com central de 12 polegadas e teto panorâmico (dados de demonstração).",
  },
  {
    demo: true,
    slug: "demo-auto-vector-2026",
    nomeComercial: "Vector",
    montadoraSlug: "demo-auto",
    marca: "Demo Auto",
    geracao: "1ª geração",
    anoModelo: 2026,
    dataLancamentoBr: "2026-03-01",
    categoria: "SUV",
    propulsao: "Elétrico",
    precoReferencia: 219900,
    situacao: "Lançado",
    confianca: "bem_fundamentado",
    resumo:
      "SUV compacto 100% elétrico com central Android nativa de 15 polegadas (dados de demonstração).",
  },
  {
    demo: true,
    slug: "placeholder-cars-aurora-sedan-2025",
    nomeComercial: "Aurora Sedã",
    montadoraSlug: "placeholder-cars",
    marca: "Placeholder Cars",
    geracao: "2ª geração",
    anoModelo: 2025,
    dataLancamentoBr: "2025-11-20",
    categoria: "Sedã",
    propulsao: "Flex",
    precoReferencia: 149900,
    situacao: "Lançado",
    confianca: "confirmado",
    resumo:
      "Sedã médio com central de 10 polegadas e CarPlay com fio (dados de demonstração).",
  },
  {
    demo: true,
    slug: "exemplo-ev-cityspark-2026",
    nomeComercial: "CitySpark",
    montadoraSlug: "exemplo-ev",
    marca: "ExemploEV",
    geracao: "1ª geração",
    anoModelo: 2026,
    dataLancamentoBr: "2026-04-10",
    categoria: "Hatch",
    propulsao: "Elétrico",
    precoReferencia: 139900,
    situacao: "Pré-venda",
    confianca: "nao_confirmado",
    resumo:
      "Hatch urbano elétrico com central de 10,25 polegadas (dados de demonstração).",
  },
  {
    demo: true,
    slug: "exemplo-motors-rally-pickup-2025",
    nomeComercial: "Rally Picape",
    montadoraSlug: "exemplo-motors",
    marca: "ExemploMotors",
    geracao: "3ª geração — reestilização",
    anoModelo: 2025,
    dataLancamentoBr: "2025-09-05",
    categoria: "Picape",
    propulsao: "Flex",
    precoReferencia: 199900,
    situacao: "Atualizado",
    confianca: "bem_fundamentado",
    resumo:
      "Reestilização de meia-vida com novo cluster digital de 12,3 polegadas (dados de demonstração).",
  },
];

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
  confianca: NivelConfianca;
  observacoes: string;
};

export type EstadoRecurso =
  | "confirmado"
  | "nao_disponivel"
  | "nao_identificado"
  | "depende_versao";

export const MULTIMIDIAS: Multimidia[] = [
  {
    demo: true,
    veiculoSlug: "exemplo-motors-horizon-suv-2026",
    fabricante: "Fabricante Demo",
    modeloEquipamento: "Modelo A-12 (fictício)",
    tamanhoTela: "12,3\"",
    resolucao: "1920×720 (fictício)",
    so: "Android Automotive OS (fictício)",
    carplayCabo: "confirmado",
    carplaySemFio: "nao_identificado",
    androidAutoCabo: "confirmado",
    androidAutoSemFio: "nao_identificado",
    bluetooth: "confirmado",
    wifi: "confirmado",
    gpsNativo: "confirmado",
    portasUsb: "2× USB-C (dianteira), 1× USB-A (traseira) — fictício",
    altoFalantes: "8 alto-falantes (fictício)",
    confianca: "nao_confirmado",
    observacoes:
      "Especificações preliminares de pré-venda. Dados precisam ser confirmados após lançamento oficial.",
  },
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    fabricante: "Fabricante Demo B",
    modeloEquipamento: "Modelo P-10 (fictício)",
    tamanhoTela: "10,25\"",
    resolucao: "1280×720 (fictício)",
    so: "Linux proprietário (fictício)",
    carplayCabo: "confirmado",
    carplaySemFio: "nao_disponivel",
    androidAutoCabo: "confirmado",
    androidAutoSemFio: "nao_disponivel",
    bluetooth: "confirmado",
    wifi: "nao_disponivel",
    gpsNativo: "depende_versao",
    portasUsb: "2× USB-A — fictício",
    altoFalantes: "6 alto-falantes (fictício)",
    confianca: "bem_fundamentado",
    observacoes: "Dados verificados em release de imprensa fictício.",
  },
];

export type Lampada = {
  demo: true;
  veiculoSlug: string;
  posicao: string;
  codigo: string;
  tecnologia: "Halógena" | "LED" | "Xenônio" | "Mista";
  potencia: string;
  oem: string;
  confianca: NivelConfianca;
};

export const LAMPADAS: Lampada[] = [
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Farol baixo",
    codigo: "H7",
    tecnologia: "Halógena",
    potencia: "55 W / 12 V",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Farol alto",
    codigo: "HB3",
    tecnologia: "Halógena",
    potencia: "60 W / 12 V",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Luz de ré",
    codigo: "W16W",
    tecnologia: "Halógena",
    potencia: "16 W / 12 V",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Luz da placa",
    codigo: "C5W",
    tecnologia: "Halógena",
    potencia: "5 W / 12 V",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
];

export type Palheta = {
  demo: true;
  veiculoSlug: string;
  posicao: "Motorista" | "Passageiro" | "Traseira";
  medidaMm: number;
  medidaPol: string;
  encaixe: string;
  formato: "Convencional" | "Flat" | "Híbrida";
  oem: string;
  confianca: NivelConfianca;
};

export const PALHETAS: Palheta[] = [
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Motorista",
    medidaMm: 600,
    medidaPol: "24\"",
    encaixe: "Push button",
    formato: "Flat",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    posicao: "Passageiro",
    medidaMm: 450,
    medidaPol: "18\"",
    encaixe: "Push button",
    formato: "Flat",
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
];

export type Interruptor = {
  demo: true;
  veiculoSlug: string;
  tipo: string;
  pinos: number;
  conector: string;
  iluminado: boolean;
  oem: string;
  confianca: NivelConfianca;
};

export const INTERRUPTORES: Interruptor[] = [
  {
    demo: true,
    veiculoSlug: "placeholder-cars-aurora-sedan-2025",
    tipo: "Interruptor quádruplo do motorista",
    pinos: 14,
    conector: "Formato retangular (fictício)",
    iluminado: true,
    oem: "A confirmar",
    confianca: "nao_confirmado",
  },
];

export type CodigoOem = {
  demo: true;
  codigo: string;
  descricao: string;
  categoria: string;
  fabricanteOriginal?: string;
  aplicacoes: string[];
  substituido?: string;
  confianca: NivelConfianca;
};

export const CODIGOS_OEM: CodigoOem[] = [
  {
    demo: true,
    codigo: "DEMO-00001-X",
    descricao: "Interruptor quádruplo demonstração",
    categoria: "Componente elétrico",
    fabricanteOriginal: "Fabricante Demo",
    aplicacoes: ["placeholder-cars-aurora-sedan-2025"],
    confianca: "nao_confirmado",
  },
  {
    demo: true,
    codigo: "DEMO-00042-A",
    descricao: "Suporte de multimídia demonstração",
    categoria: "Multimídia / acabamento",
    aplicacoes: ["exemplo-motors-horizon-suv-2026"],
    confianca: "nao_confirmado",
  },
];

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
  {
    demo: true,
    mesReferencia: "2026-09",
    marca: "ExemploEV",
    modelo: "CitySpark",
    categoria: "Hatch",
    emplacamentos: 844,
    variacaoMensal: 0.408,
    participacao: 0.004,
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
    titulo: "Adaptador CarPlay sem fio para Aurora Sedã",
    descricao:
      "O Aurora Sedã oferece CarPlay apenas via cabo. Existe demanda por adaptadores de CarPlay sem fio em fóruns de proprietários (dados fictícios).",
    veiculoAlvo: "Aurora Sedã 2025",
    categoria: "Multimídia e conectividade",
    prioridade: "Alta",
    evidencias: 7,
    pendencias: [
      "Confirmar modelo exato da central multimídia",
      "Validar compatibilidade do protocolo",
    ],
  },
  {
    demo: true,
    slug: "palheta-flat-horizon",
    titulo: "Palheta flat específica para Horizon SUV",
    descricao:
      "Medidas e encaixes do Horizon SUV ainda não foram confirmados oficialmente. Oportunidade para desenvolvimento de palheta de aplicação específica (dados fictícios).",
    veiculoAlvo: "Horizon SUV 2026",
    categoria: "Palhetas e limpadores",
    prioridade: "Média",
    evidencias: 2,
    pendencias: [
      "Obter medidas reais da palheta",
      "Confirmar tipo de encaixe",
      "Avaliar volume projetado de vendas do veículo",
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
        titulo: "Horizon SUV entra em pré-venda (fictício)",
        resumo:
          "Central multimídia de 12,3\" com Android Automotive. CarPlay com fio confirmado; versão sem fio ainda a confirmar.",
      },
      {
        demo: true,
        tipo: "Oportunidade",
        titulo: "Adaptador CarPlay sem fio para Aurora Sedã",
        resumo:
          "7 relatos em fóruns (fictícios) solicitando solução. Alta prioridade.",
      },
    ],
  },
  {
    demo: true,
    semana: "2026-W40",
    dataGeracao: "2026-10-06",
    totalNovidades: 9,
    totalOportunidades: 2,
    fatos: [
      {
        demo: true,
        tipo: "Atualização",
        titulo: "Rally Picape ganha novo cluster (fictício)",
        resumo:
          "Cluster digital 12,3\" chega à reestilização. Verificar impacto em interruptores de volante.",
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
    veiculosAlvo: ["Aurora Sedã", "Rally Picape"],
    evidenciasDemanda: 12,
    concorrentes: 4,
    observacao:
      "Alta busca em marketplaces (dado fictício). Precisa validar compatibilidade por modelo.",
  },
  {
    demo: true,
    nome: "Kit de LED H7 (farol baixo)",
    categoria: "Iluminação",
    veiculosAlvo: ["Aurora Sedã"],
    evidenciasDemanda: 8,
    concorrentes: 15,
    observacao:
      "Mercado maduro com muita concorrência (dado fictício). Diferenciação técnica necessária.",
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
    tema: "Travamento da central multimídia",
    veiculo: "Aurora Sedã 2025",
    recorrencia: 11,
    periodo: "últimos 30 dias",
    sentimento: "negativo",
    resumo:
      "Proprietários relatam reinicializações da central ao conectar CarPlay (relatos fictícios).",
  },
  {
    demo: true,
    tema: "Qualidade de áudio",
    veiculo: "Rally Picape 2025",
    recorrencia: 5,
    periodo: "últimos 60 dias",
    sentimento: "positivo",
    resumo:
      "Elogios ao áudio da versão topo de linha (relatos fictícios).",
  },
];

export const RESUMO_DASHBOARD = {
  demo: true,
  ultimaExecucao: "2026-10-13T09:12:00-03:00",
  statusExecucao: "sucesso" as const,
  novidadesSemana: 12,
  veiculosMonitorados: VEICULOS.length,
  montadorasMonitoradas: MONTADORAS.length,
  oportunidadesAbertas: OPORTUNIDADES.length,
  oemPendentes: CODIGOS_OEM.filter((c) => c.confianca === "nao_confirmado")
    .length,
  tokensUtilizadosSemana: 0,
  custoEstimadoSemanaUsd: 0,
};
