import type { Palheta } from "@/lib/tipos";

export function medidaPalheta(p: Palheta): string | null {
  if (p.medidaPol && p.medidaMm) return `${p.medidaPol}" (${p.medidaMm} mm)`;
  if (p.medidaPol) return `${p.medidaPol}"`;
  if (p.medidaMm) return `${p.medidaMm} mm`;
  return null;
}

/** Só a polegada (ou os mm, se for o que a fonte deu): usada para agrupar medidas iguais. */
function medidaCurta(p: Palheta): string | null {
  if (p.medidaPol) return `${p.medidaPol}"`;
  if (p.medidaMm) return `${p.medidaMm} mm`;
  return null;
}

function separar(palhetas: Palheta[] | undefined) {
  const lista = palhetas ?? [];
  const achar = (re: RegExp) => lista.find((p) => /diant/i.test(p.posicao) && re.test(p.posicao) && medidaCurta(p));
  return {
    motorista: achar(/motor/i),
    passageiro: achar(/passag/i),
    outraDianteira: lista.find((p) => /diant/i.test(p.posicao) && !/motor|passag/i.test(p.posicao) && medidaCurta(p)),
    traseira: lista.find((p) => /tras/i.test(p.posicao) && medidaCurta(p)),
  };
}

function texto(partes: ReturnType<typeof separar>, fmt: (p: Palheta) => string | null) {
  const { motorista, passageiro, outraDianteira, traseira } = partes;
  let dianteira: string | null = null;
  if (motorista && passageiro) dianteira = `${fmt(motorista)} + ${fmt(passageiro)}`;
  else if (motorista) dianteira = `motorista ${fmt(motorista)}`;
  else if (passageiro) dianteira = `passageiro ${fmt(passageiro)}`;
  else if (outraDianteira) dianteira = fmt(outraDianteira);
  return { dianteira, traseira: traseira ? fmt(traseira) : null };
}

/**
 * Medidas das palhetas em texto curto: dianteiras (motorista + passageiro) e traseira.
 * Quando só um lado tem medida, o lado é escrito, para não parecer o jogo completo.
 */
export function resumoPalhetas(palhetas: Palheta[] | undefined) {
  return texto(separar(palhetas), medidaPalheta);
}

/** Como `resumoPalhetas`, só com polegadas: "24" + 16"". Serve para agrupar carros com o mesmo jogo. */
export function chavePalhetas(palhetas: Palheta[] | undefined) {
  const partes = separar(palhetas);
  const usadas = [partes.motorista, partes.passageiro, partes.outraDianteira, partes.traseira].filter((p): p is Palheta => !!p);
  return { ...texto(partes, medidaCurta), usadas };
}
