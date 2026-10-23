// Oportunidades para o laboratório, calculadas com regras transparentes a
// partir do catálogo técnico (dados com fonte) e do ranking de emplacamentos.
// Nenhum número é estimado: cada item mostra o critério e a evidência.
import { projecaoSemFio, tipoFarol } from "@/lib/classificacao";
import { ligarAoCatalogo, type Emplacamento } from "@/lib/dados/emplacamentos";
import type { Veiculo } from "@/lib/tipos";

export type Alvo = {
  veiculo?: Veiculo;
  nome: string;
  vendasAno: number | null;
  /** Preenchido quando as vendas são da família inteira (ex.: "OMODA 5" para o Omoda 5 SHS-H). */
  vendasFamilia?: string;
  evidencia: string | null;
  fonteUrl: string | null;
};

export type Oportunidade = {
  chave: string;
  titulo: string;
  porQue: string;
  criterio: string;
  validar: string[];
  alvos: Alvo[];
};

function resumo(s: string | null | undefined, max = 220): string | null {
  if (!s) return null;
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

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

export function calcularOportunidades(veiculos: Veiculo[], emplacamentos: Emplacamento[]) {
  const { mapa: vendas, periodo, ranking } = vendasPorVeiculo(emplacamentos, veiculos);
  const ordenar = (a: Alvo, b: Alvo) => (b.vendasAno ?? -1) - (a.vendasAno ?? -1) || a.nome.localeCompare(b.nome);
  const alvo = (v: Veiculo, evidencia: string | null | undefined, fonteUrl: string | null | undefined): Alvo => ({
    veiculo: v,
    nome: `${v.marca} ${v.nomeComercial}`,
    vendasAno: vendas.get(v.id)?.unidades ?? null,
    vendasFamilia: vendas.get(v.id)?.familia,
    evidencia: resumo(evidencia),
    fonteUrl: fonteUrl ?? null,
  });

  const comCentral = veiculos.filter((v) => {
    const mm = v.tecnicos?.multimidia;
    return mm && (mm.carplay !== "nao_identificado" || mm.androidAuto !== "nao_identificado");
  });

  const oportunidades: Oportunidade[] = [
    {
      chave: "adaptador-sem-fio",
      titulo: "Adaptador de CarPlay / Android Auto sem fio",
      porQue:
        "Modelos com CarPlay ou Android Auto confirmados, mas sem projeção sem fio confirmada pela montadora: o dono depende do cabo e pode querer um adaptador sem fio.",
      criterio: "Central com CarPlay ou Android Auto confirmado e nenhuma versão com projeção sem fio confirmada.",
      validar: [
        "Confirmar no manual do proprietário que a conexão é só por cabo (a fonte pode apenas não citar)",
        "Testar compatibilidade do adaptador com a central de cada modelo",
      ],
      alvos: comCentral
        .filter((v) => projecaoSemFio(v) === "nenhuma")
        .map((v) => alvo(v, v.tecnicos?.multimidia?.evidencia, v.tecnicos?.multimidia?.fonteUrl))
        .sort(ordenar),
    },
    {
      chave: "sem-fio-parcial",
      titulo: "Versões de entrada sem projeção sem fio",
      porQue:
        "A montadora oferece CarPlay/Android Auto sem fio só em algumas versões: as versões de entrada tendem a ser só por cabo — público para adaptador ou central de reposição.",
      criterio: "Projeção sem fio marcada como “depende da versão”.",
      validar: ["Identificar quais versões ficam só com cabo", "Volume de vendas por versão (não informado pela Fenabrave)"],
      alvos: comCentral
        .filter((v) => projecaoSemFio(v) === "algumas")
        .map((v) => alvo(v, v.tecnicos?.multimidia?.evidencia, v.tecnicos?.multimidia?.fonteUrl))
        .sort(ordenar),
    },
    {
      chave: "iluminacao-led",
      titulo: "Iluminação: faróis halógenos em alguma versão",
      porQue:
        "Modelos em que a montadora ainda usa farol halógeno (em todas ou em parte das versões): demanda por lâmpadas de reposição de maior desempenho.",
      criterio: "Farol principal informado como halógeno, ou halógeno citado nas versões.",
      validar: [
        "Código da lâmpada (H4, H7...) no manual do proprietário",
        "Regras de homologação para troca de tecnologia de farol (Contran/Inmetro)",
      ],
      alvos: veiculos
        .filter((v) =>
          v.tecnicos?.iluminacao.some(
            (i) => /farol/i.test(i.posicao) && (/hal[oó]gen/i.test(i.tecnologia ?? "") || /hal[oó]gen/i.test(i.versoes ?? "")),
          ) || tipoFarol(v) === "halogeno",
        )
        .map((v) => {
          const f = v.tecnicos?.iluminacao.find((i) => /farol/i.test(i.posicao));
          return alvo(v, [f?.tecnologia, f?.versoes].filter(Boolean).join(" — ") || f?.evidencia, f?.fonteUrl);
        })
        .sort(ordenar),
    },
    {
      chave: "central-versoes",
      titulo: "Central multimídia para versões sem CarPlay/Android Auto",
      porQue:
        "A montadora só oferece CarPlay/Android Auto em algumas versões: as demais podem receber central multimídia de reposição.",
      criterio: "CarPlay ou Android Auto marcado como “depende da versão”.",
      validar: ["Quais versões não têm a central", "Moldura e chicote compatíveis com o painel"],
      alvos: veiculos
        .filter((v) => {
          const mm = v.tecnicos?.multimidia;
          return mm && (mm.carplay === "depende_versao" || mm.androidAuto === "depende_versao");
        })
        .map((v) => alvo(v, v.tecnicos?.multimidia?.evidencia, v.tecnicos?.multimidia?.fonteUrl))
        .sort(ordenar),
    },
    {
      chave: "lacunas",
      titulo: "Mais vendidos ainda sem ficha completa",
      porQue:
        "Modelos do ranking de vendas que ainda não estão publicados no catálogo técnico: prioridade de coleta de dados (manual do proprietário, catálogo de peças).",
      criterio: "Entre os 50 automóveis e os 50 comerciais leves mais emplacados no ano, ainda fora da lista (sem CarPlay/Android Auto identificado) ou não cadastrados.",
      validar: ["Acesso ao site oficial da marca (algumas bloqueiam leitura automática)", "Manual do proprietário em PDF"],
      alvos: ranking
        .filter((r) => !r.veiculo?.completude?.publicavel)
        .map((r) => ({
          veiculo: r.veiculo,
          nome: `${r.marca}/${r.modelo}`,
          vendasAno: r.unidades,
          evidencia: r.veiculo
            ? `Cadastrado, falta: ${r.veiculo.completude?.obrigatorios.filter((i) => !i.ok).map((i) => i.rotulo.toLowerCase()).join(", ")}`
            : "Ainda não cadastrado no catálogo",
          fonteUrl: r.fonteUrl,
        }))
        .sort(ordenar),
    },
  ];

  return { oportunidades, periodoVendas: periodo };
}
