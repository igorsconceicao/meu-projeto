// Rankings do mês por categoria, montados a partir das listas por segmento da
// Fenabrave e do ranking premium da Bright Consulting.
import { ligarAoCatalogo } from "@/lib/dados/emplacamentos";
import { PREMIUM_MARCAS, PREMIUM_MODELOS, type LinhaSegmento, type ParticipacaoSegmento } from "@/lib/dados/segmentos";
import type { Veiculo } from "@/lib/tipos";

/** O que uma linha de ranking precisa mostrar (vem da Fenabrave ou do ranking premium). */
export type ItemRanking = {
  posicao: number;
  marca: string;
  modelo: string;
  unidades: number;
  unidadesMesAnterior?: number | null;
  veiculo?: Veiculo;
  montadoraSlug?: string;
};

export type BlocoRanking = {
  chave: string;
  titulo: string;
  explicacao: string;
  fonte: string;
  fonteUrl: string | null;
  itens: ItemRanking[];
};

const BLOCOS: { chave: string; titulo: string; explicacao: string; segmentos: string[] }[] = [
  {
    chave: "populares",
    titulo: "Carros populares",
    explicacao: "Veículos de entrada (Mobi, Kwid) e hatches pequenos, os mais baratos do mercado.",
    segmentos: ["Veículos de Entrada", "Hatch Pequenos"],
  },
  {
    chave: "suvs",
    titulo: "SUVs",
    explicacao: "Todos os SUVs, do compacto ao grande.",
    segmentos: ["SUVs"],
  },
  {
    chave: "sedas",
    titulo: "Sedãs",
    explicacao: "Sedãs pequenos, compactos, médios e grandes.",
    segmentos: ["Sedans Pequenos", "Sedans Compactos", "Sedans Médios", "Sedans Grandes"],
  },
  {
    chave: "picapes",
    titulo: "Picapes",
    explicacao: "Picapes pequenas (Strada, Saveiro) e grandes (Toro, Hilux, Ranger).",
    segmentos: ["Picapes Pequenas", "Picapes Médias", "Picapes Grandes"],
  },
  {
    chave: "premium",
    titulo: "Premium",
    explicacao: "Marcas de luxo (BMW, Mercedes-Benz, Audi, Volvo, Land Rover, Porsche, Denza...).",
    segmentos: [PREMIUM_MODELOS],
  },
];

/** Monta os blocos de top 10 do mês, já ligados ao catálogo. */
export function montarRankings(linhas: LinhaSegmento[], veiculos: Veiculo[]): BlocoRanking[] {
  return BLOCOS.map((b) => {
    const doBloco = linhas
      .filter((l) => b.segmentos.includes(l.segmentoFonte) && l.unidades > 0)
      .sort((x, y) => y.unidades - x.unidades)
      .slice(0, 10)
      .map((l, i) => ({ ...l, posicao: i + 1 }));
    const premium = b.chave === "premium";
    return {
      chave: b.chave,
      titulo: b.titulo,
      explicacao: b.explicacao,
      fonte: premium ? "Bright Consulting (via CarBlog)" : "Fenabrave, por segmento",
      fonteUrl: doBloco[0]?.fonteUrl ?? null,
      itens: ligarAoCatalogo(doBloco, veiculos),
    };
  }).filter((b) => b.itens.length > 0);
}

export type ResumoClasse = {
  segmento: string;
  explicacao: string;
  participacao: number;
  variacao: number | null;
  lider: LinhaSegmento | null;
};

const EXPLICA: Record<string, string> = {
  "Veículos de Entrada": "Os mais baratos: Mobi e Kwid",
  "Hatch Pequenos": "Polo, Argo, Onix, HB20, Dolphin Mini",
  "Hatch Médios": "Golf, Audi A3, BMW Série 1",
  "Sedans Pequenos": "HB20S, Cronos",
  "Sedans Compactos": "Onix Plus, Virtus, City",
  "Sedans Médios": "Corolla, BYD King, Jetta",
  "Sedans Grandes": "BMW Série 3, Classe C, Série 5",
  SUVs: "Do T-Cross ao Haval H6",
  Grandcab: "Spin, Carnival",
  Sports: "Esportivos: 911, Mustang, M2",
};

/** Participação de cada segmento no total de automóveis do mês, com o líder de cada um. */
export function resumoPorClasse(participacao: ParticipacaoSegmento[], linhas: LinhaSegmento[]): ResumoClasse[] {
  return participacao
    .filter((p) => p.mes > 0 && p.segmento !== "Outros")
    .sort((a, b) => b.mes - a.mes)
    .map((p) => {
      const lider =
        linhas.filter((l) => l.segmentoFonte === p.segmento).sort((a, b) => b.unidades - a.unidades)[0] ?? null;
      return {
        segmento: p.segmento,
        explicacao: EXPLICA[p.segmento] ?? "",
        participacao: p.mes,
        variacao: p.mesAnterior === null ? null : Math.round((p.mes - p.mesAnterior) * 100) / 100,
        lider,
      };
    });
}

/** Total do mercado premium e as marcas mais vendidas (Bright Consulting). */
export function resumoPremium(linhas: LinhaSegmento[]) {
  const marcas = linhas.filter((l) => l.segmentoFonte === PREMIUM_MARCAS).sort((a, b) => b.unidades - a.unidades);
  return {
    marcas,
    totalMarcas: marcas.reduce((s, m) => s + m.unidades, 0),
    fonteUrl: marcas[0]?.fonteUrl ?? null,
  };
}
