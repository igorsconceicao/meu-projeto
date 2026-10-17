// Classificações derivadas dos dados técnicos, usadas em filtros e no painel.
import type { Veiculo } from "@/lib/tipos";

/** Projeção sem fio de CarPlay/Android Auto: em todas, em algumas ou em nenhuma versão confirmada. */
export function projecaoSemFio(v: Veiculo): "todas" | "algumas" | "nenhuma" {
  const mm = v.tecnicos?.multimidia;
  if (!mm) return "nenhuma";
  const estados = [mm.carplaySemFio, mm.androidAutoSemFio];
  if (estados.includes("confirmado")) return "todas";
  if (estados.includes("depende_versao")) return "algumas";
  return "nenhuma";
}

/** Tecnologia do farol principal: LED em ao menos uma versão, só halógeno, ou outra/indefinida. */
export function tipoFarol(v: Veiculo): "led" | "halogeno" | "outro" {
  const f = v.tecnicos?.iluminacao.filter((i) => /farol/i.test(i.posicao) && i.tecnologia) ?? [];
  if (f.some((i) => /led/i.test(i.tecnologia!))) return "led";
  if (f.some((i) => /hal[oó]gen/i.test(i.tecnologia!))) return "halogeno";
  return "outro";
}

/** Como `tipoFarol`, mas separa os modelos com halógeno em umas versões e LED em outras. */
export function farolPorVersao(v: Veiculo): "led" | "misto" | "halogeno" | "outro" {
  const f = v.tecnicos?.iluminacao.filter((i) => /farol/i.test(i.posicao) && i.tecnologia) ?? [];
  const led = f.some((i) => /led/i.test(i.tecnologia!));
  const halogeno = f.some((i) => /hal[oó]gen/i.test(i.tecnologia!));
  if (led && halogeno) return "misto";
  if (led) return "led";
  if (halogeno) return "halogeno";
  return "outro";
}
