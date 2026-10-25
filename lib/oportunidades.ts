// Oportunidades para o laboratório, calculadas com regras simples a partir do
// catálogo técnico (dados com fonte) e do ranking de emplacamentos da Fenabrave.
// Nenhum número é estimado: as vendas são as publicadas e cada dado do carro tem fonte.
import { farolPorVersao, tipoFarol } from "@/lib/classificacao";
import { ligarAoCatalogo, type Emplacamento } from "@/lib/dados/emplacamentos";
import { chavePalhetas } from "@/lib/palhetas";
import type { EstadoConectividade, Veiculo } from "@/lib/tipos";

/** Quão firme é a oportunidade no modelo: a fonte confirma, vale só para parte das versões, ou falta confirmar. */
export type Certeza = "confirmado" | "parcial" | "conferir";

export type Alvo = {
  veiculo?: Veiculo;
  nome: string;
  vendasAno: number | null;
  /** Preenchido quando as vendas são da família inteira (ex.: "OMODA 5" para o Omoda 5 SHS-H). */
  vendasFamilia?: string;
  /** O que o carro tem hoje, em poucas palavras. */
  situacao: string;
  certeza: Certeza;
  fonteUrl: string | null;
};

export type GrupoMedida = { medida: string; alvos: Alvo[]; vendas: number; aConferir: boolean };

export type Oportunidade = {
  chave: string;
  titulo: string;
  /** O que a importadora venderia. */
  produto: string;
  oQueE: string;
  comoEscolhemos: string;
  validar: string[];
  alvos: Alvo[];
  /** Soma dos emplacamentos no ano dos modelos que estão no ranking. */
  vendasTotal: number;
  grupos?: { titulo: string; descricao: string; itens: GrupoMedida[] }[];
};

/** Vendas acumuladas no ano (último informativo) por id de veículo do catálogo. */
function vendasPorVeiculo(emplacamentos: Emplacamento[], veiculos: Veiculo[]) {
  const ultimo = emplacamentos.filter((e) => e.tipo === "acumulado").map((e) => e.periodo).sort().at(-1);
  const mapa = new Map<string, { unidades: number; familia?: string }>();
  if (!ultimo) return { mapa, periodo: null as string | null, ranking: [] as ReturnType<typeof ligarAoCatalogo> };
  const ranking = ligarAoCatalogo(
    emplacamentos.filter((e) => e.tipo === "acumulado" && e.periodo === ultimo),
    veiculos,
  );
  for (const r of ranking) {
    if (!r.veiculo) continue;
    const atual = mapa.get(r.veiculo.id);
    mapa.set(r.veiculo.id, {
      unidades: (atual?.unidades ?? 0) + r.unidades,
      familia: r.ligacao === "familia" ? `${r.marca}/${r.modelo}` : atual?.familia,
    });
  }
  return { mapa, periodo: ultimo, ranking };
}

const ORDEM_CERTEZA: Record<Certeza, number> = { confirmado: 0, parcial: 1, conferir: 2 };
const porVendas = (a: Alvo, b: Alvo) => (b.vendasAno ?? -1) - (a.vendasAno ?? -1) || a.nome.localeCompare(b.nome);
/** Primeiro o que a fonte confirma, depois o mais vendido. */
const porCertezaEVendas = (a: Alvo, b: Alvo) => ORDEM_CERTEZA[a.certeza] - ORDEM_CERTEZA[b.certeza] || porVendas(a, b);
const somaVendas = (alvos: Alvo[]) => alvos.reduce((s, a) => s + (a.vendasAno ?? 0), 0);
const temProjecao = (e: EstadoConectividade | undefined) => e === "confirmado" || e === "depende_versao";

function agrupar(itens: { alvo: Alvo; medida: string | null }[]): GrupoMedida[] {
  const grupos = new Map<string, Alvo[]>();
  for (const { alvo, medida } of itens) {
    if (medida) grupos.set(medida, [...(grupos.get(medida) ?? []), alvo]);
  }
  return [...grupos.entries()]
    .map(([medida, alvos]) => ({
      medida,
      alvos: alvos.sort(porVendas),
      vendas: somaVendas(alvos),
      aConferir: alvos.some((a) => a.certeza === "conferir"),
    }))
    .sort((a, b) => b.vendas - a.vendas || b.alvos.length - a.alvos.length);
}

export function calcularOportunidades(veiculos: Veiculo[], emplacamentos: Emplacamento[]) {
  const { mapa: vendas, periodo, ranking } = vendasPorVeiculo(emplacamentos, veiculos);
  const alvo = (v: Veiculo, situacao: string, certeza: Certeza, fonteUrl: string | null | undefined): Alvo => ({
    veiculo: v,
    nome: `${v.marca} ${v.nomeComercial}`,
    vendasAno: vendas.get(v.id)?.unidades ?? null,
    vendasFamilia: vendas.get(v.id)?.familia,
    situacao,
    certeza,
    fonteUrl: fonteUrl ?? null,
  });

  // 1. Adaptador sem fio: tem CarPlay/Android Auto, mas nenhuma fonte confirma o sem fio em todas as versões.
  const adaptador = veiculos.flatMap((v) => {
    const mm = v.tecnicos?.multimidia;
    if (!mm || !(temProjecao(mm.carplay) || temProjecao(mm.androidAuto))) return [];
    const semFio = [mm.carplaySemFio, mm.androidAutoSemFio];
    if (semFio.includes("confirmado")) return [];
    if (semFio.includes("depende_versao")) {
      return [alvo(v, "Sem fio só em algumas versões; as outras usam cabo", "parcial", mm.fonteUrl)];
    }
    const cpCabo = mm.carplaySemFio === "nao_disponivel";
    const aaCabo = mm.androidAutoSemFio === "nao_disponivel";
    if (cpCabo || aaCabo) {
      const quem = cpCabo && aaCabo ? "CarPlay e Android Auto" : cpCabo ? "CarPlay" : "Android Auto";
      return [alvo(v, `${quem} só funciona com cabo`, "confirmado", mm.fonteUrl)];
    }
    const cabo = mm.carplayCabo === "confirmado" || mm.androidAutoCabo === "confirmado";
    return [alvo(v, cabo ? "Funciona com cabo; a fonte não diz se há sem fio" : "A fonte não diz se há sem fio", "conferir", mm.fonteUrl)];
  });

  // 2. Palhetas: todo carro com medida conhecida, agrupado pelo jogo dianteiro e pela traseira.
  const palhetas = veiculos.flatMap((v) => {
    const k = chavePalhetas(v.tecnicos?.palhetas);
    if (!k.dianteira && !k.traseira) return [];
    const aConferir = k.usadas.some((p) => p.confianca === "nao_confirmado");
    const situacao = [k.dianteira ? `Dianteira ${k.dianteira}` : null, k.traseira ? `traseira ${k.traseira}` : null]
      .filter(Boolean)
      .join(" · ");
    return [{ alvo: alvo(v, situacao, aConferir ? "conferir" : "confirmado", k.usadas[0]?.fonteUrl), k }];
  });
  const jogoCompleto = (d: string | null) => (d && !/^(motorista|passageiro)/.test(d) ? d : null);

  // 3. Central multimídia: CarPlay/Android Auto só em algumas versões, ou ausente de fábrica.
  const central = veiculos.flatMap((v) => {
    const mm = v.tecnicos?.multimidia;
    if (!mm) return [];
    const estados = [mm.carplay, mm.androidAuto];
    if (estados.includes("depende_versao")) {
      return [alvo(v, "CarPlay/Android Auto só em algumas versões", "parcial", mm.fonteUrl)];
    }
    const semCp = mm.carplay === "nao_disponivel";
    const semAa = mm.androidAuto === "nao_disponivel";
    if (!semCp && !semAa) return [];
    const falta = semCp && semAa ? "Não tem CarPlay nem Android Auto" : semCp ? "Não tem CarPlay" : "Não tem Android Auto";
    return [alvo(v, falta, "confirmado", mm.fonteUrl)];
  });

  // 4. Lâmpadas: farol halógeno em todas ou em parte das versões.
  const lampadas = veiculos.flatMap((v) => {
    const farois = v.tecnicos?.iluminacao.filter((i) => /farol/i.test(i.posicao)) ?? [];
    const halogenos = farois.filter((i) => /hal[oó]gen/i.test(i.tecnologia ?? "") || /hal[oó]gen/i.test(i.versoes ?? ""));
    if (!halogenos.length && tipoFarol(v) !== "halogeno") return [];
    const parcial = farolPorVersao(v) === "misto" || halogenos.some((i) => /hal[oó]gen/i.test(i.versoes ?? ""));
    const codigos = [...new Set(halogenos.map((i) => i.codigo).filter(Boolean))].join(" / ");
    const situacao = `${parcial ? "Halógeno em parte das versões" : "Farol halógeno"} · ${codigos ? `lâmpada ${codigos}` : "código da lâmpada a confirmar"}`;
    return [alvo(v, situacao, parcial ? "parcial" : "confirmado", (halogenos[0] ?? farois[0])?.fonteUrl)];
  });

  const montar = (o: Omit<Oportunidade, "vendasTotal">, ordem: (a: Alvo, b: Alvo) => number): Oportunidade => {
    const alvos = [...o.alvos].sort(ordem);
    return { ...o, alvos, vendasTotal: somaVendas(alvos) };
  };

  const oportunidades: Oportunidade[] = [
    montar(
      {
        chave: "adaptador-sem-fio",
        titulo: "Adaptador de CarPlay / Android Auto sem fio",
        produto: "Adaptador sem fio que liga na porta USB do carro e conecta o celular sozinho, sem cabo.",
        oQueE: "Carros que já têm CarPlay ou Android Auto, mas em que o celular precisa ficar ligado no cabo.",
        comoEscolhemos: "Tem CarPlay ou Android Auto de fábrica e nenhuma fonte confirma a conexão sem fio em todas as versões.",
        validar: [
          "Quando a etiqueta for “Conferir”, ver no manual se a conexão é mesmo só por cabo",
          "Testar o adaptador na central de cada modelo (compatibilidade varia)",
        ],
        alvos: adaptador,
      },
      porCertezaEVendas,
    ),
    montar(
      {
        chave: "palhetas",
        titulo: "Palhetas de reposição",
        produto: "Palhetas dianteiras (jogo motorista + passageiro) e traseiras nas medidas mais usadas.",
        oQueE: "Palheta é peça de troca periódica em qualquer carro. Saber as medidas dos carros que mais vendem mostra quais tamanhos estocar primeiro.",
        comoEscolhemos: "Todo carro do catálogo com medida de palheta informada por catálogo de fabricante de palhetas, manual ou loja.",
        validar: [
          "Quando a etiqueta for “Conferir”, a medida veio de loja ou de catálogo que não cita o ano atual",
          "Conferir o tipo de encaixe do braço de cada modelo (está na ficha quando a fonte informa)",
        ],
        alvos: palhetas.map((p) => p.alvo),
        grupos: [
          {
            titulo: "Jogos dianteiros mais usados",
            descricao: "Carros que usam o mesmo par de palhetas (motorista + passageiro).",
            itens: agrupar(palhetas.map((p) => ({ alvo: p.alvo, medida: jogoCompleto(p.k.dianteira) }))),
          },
          {
            titulo: "Palhetas traseiras mais usadas",
            descricao: "Carros com limpador traseiro e a medida da palheta.",
            itens: agrupar(palhetas.map((p) => ({ alvo: p.alvo, medida: p.k.traseira }))),
          },
        ],
      },
      porVendas,
    ),
    montar(
      {
        chave: "central-multimidia",
        titulo: "Central multimídia de reposição",
        produto: "Central multimídia com CarPlay e Android Auto para as versões que saem de fábrica sem eles.",
        oQueE: "Carros em que só algumas versões têm CarPlay/Android Auto, ou que não têm de fábrica.",
        comoEscolhemos: "CarPlay ou Android Auto marcado como “só em algumas versões” ou “não tem” pela fonte.",
        validar: [
          "Quais versões saem sem a central (ver a ficha de versões da montadora)",
          "Se o painel aceita troca: telas grandes integradas, como em vários elétricos, não permitem",
          "Moldura e chicote compatíveis com o painel",
        ],
        alvos: central,
      },
      porCertezaEVendas,
    ),
    montar(
      {
        chave: "lampadas",
        titulo: "Lâmpadas para faróis halógenos",
        produto: "Lâmpadas halógenas de maior rendimento (e LED, onde a lei permitir) para o farol principal.",
        oQueE: "Carros que ainda usam farol halógeno em todas ou em parte das versões.",
        comoEscolhemos: "Farol principal informado como halógeno pela fonte, em todas ou em algumas versões.",
        validar: [
          "Código da lâmpada (H4, H7...) no manual quando estiver “a confirmar”",
          "Regras de homologação para trocar a tecnologia do farol (Contran/Inmetro)",
        ],
        alvos: lampadas,
      },
      porCertezaEVendas,
    ),
  ];

  // Mais vendidos que ainda não dá para avaliar (sem CarPlay/Android Auto identificado ou não cadastrados).
  const semDados: Alvo[] = ranking
    .filter((r) => !r.veiculo?.completude?.publicavel)
    .map((r) => ({
      veiculo: r.veiculo,
      nome: `${r.marca}/${r.modelo}`,
      vendasAno: r.unidades,
      situacao: r.veiculo ? "Cadastrado, mas CarPlay/Android Auto ainda sem fonte" : "Ainda não cadastrado",
      certeza: "conferir" as const,
      fonteUrl: r.fonteUrl,
    }))
    .sort(porVendas);

  return { oportunidades, semDados, periodoVendas: periodo };
}
