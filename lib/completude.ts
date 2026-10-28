// Regra de publicação (desde 2026-10-23, prioridade do usuário): o veículo
// aparece no site assim que CarPlay e Android Auto estiverem identificados,
// com fonte. O resto aparece como pendência — primeiro o que a importadora
// mais usa (cabo/sem fio, tela, palhetas, lâmpadas), depois foto e mecânica.
import type { Completude, DadosTecnicos, ItemChecklist, Veiculo } from "@/lib/tipos";

/** Fonte oficial brasileira do modelo (Wikipedia não conta como oficial). */
export function fonteOficialBr(v: Veiculo): string | null {
  for (const url of [v.linkOficialUrl, v.verificadoBrUrl]) {
    if (url && !/wikipedia\.org/i.test(url)) return url;
  }
  return null;
}

const identificado = (e: string | undefined) => !!e && e !== "nao_identificado";

export function avaliarCompletude(v: Veiculo, d: DadosTecnicos): Completude {
  const { ficha, multimidia: mm, iluminacao, palhetas, interruptores, versoes } = d;
  const eletrico = v.propulsao === "Elétrico";

  const obrigatorios: ItemChecklist[] = [
    {
      chave: "conectividade",
      rotulo: "CarPlay e Android Auto",
      ok: !!mm && identificado(mm.carplay) && identificado(mm.androidAuto),
    },
  ];

  const complementares: ItemChecklist[] = [
    {
      chave: "conexao",
      rotulo: "CarPlay/Android Auto: cabo e sem fio",
      ok:
        !!mm &&
        (identificado(mm.carplaySemFio) || identificado(mm.androidAutoSemFio)) &&
        (identificado(mm.carplayCabo) || identificado(mm.androidAutoCabo) ||
          mm.carplaySemFio === "confirmado" || mm.androidAutoSemFio === "confirmado"),
    },
    { chave: "tela", rotulo: "Tela da central multimídia", ok: !!mm?.telaPolegadas },
    {
      chave: "palhetas",
      rotulo: "Palhetas dianteiras (medidas)",
      ok: palhetas.some((p) => /diant/i.test(p.posicao) && (p.medidaMm || p.medidaPol)),
    },
    {
      chave: "palheta-traseira",
      rotulo: "Palheta traseira (medida)",
      ok: palhetas.some((p) => /tras/i.test(p.posicao) && (p.medidaMm || p.medidaPol)),
    },
    { chave: "lampadas", rotulo: "Códigos das lâmpadas (H4, H7...)", ok: iluminacao.some((i) => !!i.codigo) },
    { chave: "farol", rotulo: "Tecnologia dos faróis", ok: iluminacao.some((i) => /farol/i.test(i.posicao) && !!i.tecnologia) },
    { chave: "foto", rotulo: "Foto da versão brasileira", ok: !!v.fotoPrincipalUrl },
    {
      chave: "mecanica",
      rotulo: eletrico ? "Motor e bateria" : "Motor e câmbio",
      ok: !!(ficha?.motor || ficha?.potencia) && !!(eletrico ? ficha?.bateria || ficha?.autonomia : ficha?.cambio),
    },
    { chave: "versoes", rotulo: "Versões (da entrada à topo)", ok: versoes.length > 0 },
    { chave: "interruptores", rotulo: "Interruptores dos vidros", ok: interruptores.length > 0 },
    {
      chave: "oem",
      rotulo: "Códigos OEM",
      ok: [...iluminacao, ...palhetas, ...interruptores].some((i) => !!i.oem),
    },
  ];

  return {
    publicavel: obrigatorios.every((i) => i.ok),
    obrigatorios,
    complementares,
  };
}
