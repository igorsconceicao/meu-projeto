// Configuração dos formulários de dados técnicos do painel admin. Fica fora
// do arquivo de server actions para poder ser usada também no cliente.
import type { EstadoConectividade } from "@/lib/tipos";

export type TabelaTecnica =
  | "fichas_tecnicas"
  | "multimidias"
  | "iluminacao"
  | "palhetas"
  | "interruptores_vidro";

export type CampoTecnico = {
  nome: string;
  rotulo: string;
  tipo: "texto" | "numero" | "estado" | "area";
  dica?: string;
  obrigatorio?: boolean;
};

export const ESTADOS: { valor: EstadoConectividade; rotulo: string }[] = [
  { valor: "nao_identificado", rotulo: "Não identificado" },
  { valor: "confirmado", rotulo: "Confirmado" },
  { valor: "depende_versao", rotulo: "Depende da versão" },
  { valor: "nao_disponivel", rotulo: "Não disponível" },
];

export const CONFIANCAS = [
  { valor: "confirmado", rotulo: "Confirmado (fonte oficial)" },
  { valor: "bem_fundamentado", rotulo: "Bem fundamentado" },
  { valor: "nao_confirmado", rotulo: "Não confirmado" },
] as const;

/** Tabelas com uma linha por veículo (as demais têm uma linha por posição). */
export const TABELAS_UNICAS: TabelaTecnica[] = ["fichas_tecnicas", "multimidias"];

export const CAMPOS_TECNICOS: Record<TabelaTecnica, CampoTecnico[]> = {
  fichas_tecnicas: [
    { nome: "versao_referencia", rotulo: "Versão de referência", tipo: "texto", dica: "Ex.: Highline 200 TSI" },
    { nome: "motor", rotulo: "Motor", tipo: "texto", dica: "Ex.: 1.0 turbo flex" },
    { nome: "potencia", rotulo: "Potência", tipo: "texto", dica: "Ex.: 116 cv (E) / 109 cv (G)" },
    { nome: "torque", rotulo: "Torque", tipo: "texto" },
    { nome: "cambio", rotulo: "Câmbio", tipo: "texto", dica: "Ex.: automático de 6 marchas" },
    { nome: "tracao", rotulo: "Tração", tipo: "texto" },
    { nome: "bateria", rotulo: "Bateria (elétricos/híbridos)", tipo: "texto", dica: "Ex.: 60,48 kWh" },
    { nome: "autonomia", rotulo: "Autonomia", tipo: "texto", dica: "Informe o ciclo (Inmetro/PBEV)" },
  ],
  multimidias: [
    { nome: "tela_polegadas", rotulo: "Tela da central", tipo: "texto", dica: "Ex.: 10,1\"" },
    { nome: "sistema", rotulo: "Sistema / nome da central", tipo: "texto", dica: "Ex.: VW Play" },
    { nome: "carplay", rotulo: "Apple CarPlay", tipo: "estado" },
    { nome: "android_auto", rotulo: "Android Auto", tipo: "estado" },
    { nome: "carplay_cabo", rotulo: "CarPlay por cabo", tipo: "estado" },
    { nome: "carplay_sem_fio", rotulo: "CarPlay sem fio", tipo: "estado", dica: "Só marque confirmado se a fonte disser “sem fio”" },
    { nome: "android_auto_cabo", rotulo: "Android Auto por cabo", tipo: "estado" },
    { nome: "android_auto_sem_fio", rotulo: "Android Auto sem fio", tipo: "estado", dica: "Só marque confirmado se a fonte disser “sem fio”" },
    { nome: "observacoes", rotulo: "Observações", tipo: "area", dica: "Ex.: sem fio só na versão topo" },
  ],
  iluminacao: [
    { nome: "posicao", rotulo: "Posição", tipo: "texto", obrigatorio: true, dica: "Farol principal, farol baixo, luz diurna, lanterna…" },
    { nome: "tecnologia", rotulo: "Tecnologia", tipo: "texto", dica: "LED, halógeno, Full LED…" },
    { nome: "codigo", rotulo: "Código da lâmpada", tipo: "texto", dica: "H4, H7, W5W… (do manual)" },
    { nome: "potencia", rotulo: "Potência", tipo: "texto", dica: "Ex.: 55 W" },
    { nome: "oem", rotulo: "Código OEM", tipo: "texto", dica: "Somente com fonte" },
    { nome: "versoes", rotulo: "Versões", tipo: "texto", dica: "Em quais versões vale" },
  ],
  palhetas: [
    { nome: "posicao", rotulo: "Posição", tipo: "texto", obrigatorio: true, dica: "Motorista, passageiro, traseira" },
    { nome: "medida_mm", rotulo: "Medida (mm)", tipo: "numero" },
    { nome: "medida_pol", rotulo: "Medida (polegadas)", tipo: "numero" },
    { nome: "encaixe", rotulo: "Encaixe", tipo: "texto", dica: "Gancho U, pino lateral, push button…" },
    { nome: "oem", rotulo: "Código OEM", tipo: "texto", dica: "Somente com fonte" },
  ],
  interruptores_vidro: [
    { nome: "posicao", rotulo: "Posição", tipo: "texto", obrigatorio: true, dica: "Motorista (quádruplo), passageiro…" },
    { nome: "tipo", rotulo: "Tipo", tipo: "texto", dica: "Simples, duplo, quádruplo, com one-touch" },
    { nome: "oem", rotulo: "Código OEM", tipo: "texto", dica: "Somente com fonte" },
    { nome: "pinos", rotulo: "Pinos", tipo: "numero" },
    { nome: "conector", rotulo: "Conector", tipo: "texto" },
  ],
};

export const TITULOS_TABELA: Record<TabelaTecnica, string> = {
  fichas_tecnicas: "Ficha técnica",
  multimidias: "Multimídia e conectividade",
  iluminacao: "Iluminação",
  palhetas: "Palhetas",
  interruptores_vidro: "Interruptores dos vidros",
};
