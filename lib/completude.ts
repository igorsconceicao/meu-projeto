// Regra de publicação: um veículo só aparece no site público quando tem o
// pacote mínimo de informações reais e com fonte. O restante (códigos de
// lâmpada, palhetas, interruptores, OEM) aparece como pendência registrada.
import type { Completude, DadosTecnicos, ItemChecklist, Veiculo } from "@/lib/tipos";

/** Fonte oficial brasileira do modelo (Wikipedia não conta como oficial). */
export function fonteOficialBr(v: Veiculo): string | null {
  for (const url of [v.linkOficialUrl, v.verificadoBrUrl]) {
    if (url && !/wikipedia\.org/i.test(url)) return url;
  }
  return null;
}

export function avaliarCompletude(v: Veiculo, d: DadosTecnicos): Completude {
  const { ficha, multimidia: mm, iluminacao, palhetas, interruptores } = d;
  const eletrico = v.propulsao === "Elétrico";

  const obrigatorios: ItemChecklist[] = [
    { chave: "foto", rotulo: "Foto real da versão brasileira", ok: !!v.fotoPrincipalUrl },
    { chave: "fonte", rotulo: "Fonte oficial brasileira", ok: !!fonteOficialBr(v) },
    { chave: "motor", rotulo: "Motorização", ok: !!(ficha?.motor || ficha?.potencia) },
    eletrico
      ? { chave: "bateria", rotulo: "Bateria ou autonomia", ok: !!(ficha?.bateria || ficha?.autonomia) }
      : { chave: "cambio", rotulo: "Câmbio", ok: !!ficha?.cambio },
    { chave: "tela", rotulo: "Tela da central multimídia", ok: !!mm?.telaPolegadas },
    {
      chave: "conectividade",
      rotulo: "CarPlay e Android Auto",
      ok: !!mm && mm.carplay !== "nao_identificado" && mm.androidAuto !== "nao_identificado",
    },
    {
      chave: "farol",
      rotulo: "Tecnologia dos faróis",
      ok: iluminacao.some((i) => /farol/i.test(i.posicao) && !!i.tecnologia),
    },
  ];

  const complementares: ItemChecklist[] = [
    {
      chave: "conexao",
      rotulo: "CarPlay/Android Auto: cabo e sem fio",
      ok:
        !!mm &&
        [mm.carplayCabo, mm.carplaySemFio, mm.androidAutoCabo, mm.androidAutoSemFio].every(
          (e) => e !== "nao_identificado",
        ),
    },
    { chave: "lampadas", rotulo: "Códigos das lâmpadas (H4, H7...)", ok: iluminacao.some((i) => !!i.codigo) },
    { chave: "palhetas", rotulo: "Palhetas (medidas e encaixe)", ok: palhetas.length > 0 },
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
