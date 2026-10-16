// Busca no catálogo (montadoras, veículos publicados e componentes com código).
// Tudo em memória: o catálogo é pequeno (dezenas/centenas de modelos).
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import type { Montadora, Veiculo } from "@/lib/tipos";

export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.,"]+/g, " ")
    .trim();
}

function termos(q: string): string[] {
  return normalizar(q).split(" ").filter((t) => t.length > 0);
}

/** Texto pesquisável de um veículo: identificação + dados técnicos com fonte. */
function textoVeiculo(v: Veiculo): string {
  const t = v.tecnicos;
  const partes: (string | null | undefined)[] = [
    v.marca,
    v.nomeComercial,
    v.slug.replace(/-/g, " "),
    v.categoria,
    v.propulsao,
    v.geracao,
    v.resumo,
    v.anoModelo ? String(v.anoModelo) : null,
    t?.ficha?.motor,
    t?.ficha?.potencia,
    t?.ficha?.cambio,
    t?.ficha?.tracao,
    t?.multimidia?.sistema,
    t?.multimidia?.telaPolegadas,
    t?.multimidia?.carplay === "confirmado" ? "carplay" : null,
    t?.multimidia?.androidAuto === "confirmado" ? "android auto" : null,
    t?.multimidia &&
    [t.multimidia.carplaySemFio, t.multimidia.androidAutoSemFio].some(
      (e) => e === "confirmado" || e === "depende_versao",
    )
      ? "sem fio wireless"
      : null,
    ...(t?.iluminacao ?? []).flatMap((i) => [i.posicao, i.tecnologia, i.codigo, i.oem]),
    ...(t?.palhetas ?? []).flatMap((p) => [p.posicao, p.encaixe, p.oem, p.medidaMm ? `${p.medidaMm}mm` : null]),
    ...(t?.interruptores ?? []).flatMap((i) => [i.posicao, i.tipo, i.oem]),
  ];
  return normalizar(partes.filter(Boolean).join(" "));
}

function textoMontadora(m: Montadora): string {
  return normalizar([m.nome, m.slug, m.grupo, m.pais].filter(Boolean).join(" "));
}

export type ResultadoComponente = {
  veiculo: Veiculo;
  tipo: "Lâmpada" | "Palheta" | "Interruptor";
  posicao: string;
  codigo: string;
};

export type ResultadoBusca = {
  termo: string;
  montadoras: Montadora[];
  veiculos: Veiculo[];
  componentes: ResultadoComponente[];
  /** Modelos que batem com a busca mas ainda não têm o pacote mínimo. */
  emVerificacao: number;
};

function componentesDe(v: Veiculo, ts: string[]): ResultadoComponente[] {
  const t = v.tecnicos;
  if (!t) return [];
  const itens: ResultadoComponente[] = [];
  const bate = (codigo: string | null) =>
    !!codigo && ts.every((x) => normalizar(codigo).includes(x));
  for (const i of t.iluminacao) {
    for (const c of [i.codigo, i.oem]) {
      if (bate(c)) itens.push({ veiculo: v, tipo: "Lâmpada", posicao: i.posicao, codigo: c! });
    }
  }
  for (const p of t.palhetas) {
    if (bate(p.oem)) itens.push({ veiculo: v, tipo: "Palheta", posicao: p.posicao, codigo: p.oem! });
  }
  for (const i of t.interruptores) {
    if (bate(i.oem)) itens.push({ veiculo: v, tipo: "Interruptor", posicao: i.posicao, codigo: i.oem! });
  }
  return itens;
}

export async function buscarNoCatalogo(q: string, limite = 50): Promise<ResultadoBusca> {
  const ts = termos(q);
  const vazio: ResultadoBusca = { termo: q, montadoras: [], veiculos: [], componentes: [], emVerificacao: 0 };
  if (ts.length === 0) return vazio;

  const [montadoras, veiculos] = await Promise.all([buscarMontadoras(), buscarVeiculos()]);
  const bate = (texto: string) => ts.every((t) => texto.includes(t));

  const veiculosQueBatem = veiculos.filter((v) => bate(textoVeiculo(v)));
  const publicados = veiculosQueBatem.filter((v) => v.completude?.publicavel);

  return {
    termo: q,
    montadoras: montadoras.filter((m) => bate(textoMontadora(m))).slice(0, limite),
    veiculos: publicados.slice(0, limite),
    componentes: publicados.flatMap((v) => componentesDe(v, ts)).slice(0, limite),
    emVerificacao: veiculosQueBatem.length - publicados.length,
  };
}
