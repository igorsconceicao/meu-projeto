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

/**
 * CarPlay/Android Auto pela porta USB (é por ela que o Streambox conecta): funciona por cabo,
 * só sem fio (a fonte diz que o cabo não funciona) ou ainda sem informação.
 */
export function conexaoCabo(v: Veiculo): "cabo" | "so-sem-fio" | "sem-info" {
  const mm = v.tecnicos?.multimidia;
  if (!mm) return "sem-info";
  const temCabo = (e: string) => e === "confirmado" || e === "depende_versao";
  if (temCabo(mm.carplayCabo) || temCabo(mm.androidAutoCabo)) return "cabo";
  const soSemFio = (cabo: string, semFio: string) => cabo === "nao_disponivel" && semFio === "confirmado";
  if (soSemFio(mm.carplayCabo, mm.carplaySemFio) || soSemFio(mm.androidAutoCabo, mm.androidAutoSemFio)) return "so-sem-fio";
  return "sem-info";
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
