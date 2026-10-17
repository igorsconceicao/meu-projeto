// Cobertura do catálogo frente às páginas oficiais monitoradas: quais páginas
// de modelo a marca mostra hoje que ainda não têm um veículo cadastrado.
import { normalizar } from "@/lib/busca";
import type { Veiculo } from "@/lib/tipos";

export type LinkMonitorado = { url: string; texto: string };

function host(url: string | null | undefined): string | null {
  try {
    return url ? new URL(url).host.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}

function chaveUrl(url: string): string {
  const u = new URL(url);
  return `${u.host.replace(/^www\./, "")}${u.pathname.replace(/\/+$/, "").replace(/\.html?$/, "").toLowerCase()}`;
}

function palavras(s: string): string[] {
  return normalizar(decodeURIComponent(s)).split(/[^a-z0-9]+/).filter(Boolean);
}

/** Página de ano-modelo antigo ou de modelo histórico (ex.: "argo-my-2019", "tempra-1991-1998-my-legado"). */
function anoAntigo(caminho: string, anoAtual: number): boolean {
  if (/legado|heritage/.test(caminho)) return true;
  const anos = [
    ...[...caminho.matchAll(/(?:^|\D)((?:19|20)\d{2})(?!\d)/g)].map((m) => Number(m[1])),
    ...[...caminho.matchAll(/my-?(\d{2})(?!\d)/g)].map((m) => 2000 + Number(m[1])),
  ];
  return anos.length > 0 && Math.max(...anos) < anoAtual - 1;
}

// Páginas de listagem ou institucionais que passam no filtro de "página de modelo".
const LISTAGEM = /^(modelos?|todos|todos-os-modelos|modelos-de-carros|carros-eletricos|comprar-carro|guias?)$/;
const TITULO_GENERICO = /^(explore|saiba|conhe[cç]a|veja|ver|descubra|clique|mais)\b/i;

/** Família do modelo sem o ano-modelo no fim ("fiat-argo-my26" → "fiat-argo"). */
function familia(segmento: string): string {
  const p = segmento.replace(/\.html?$/, "").split("-").filter(Boolean);
  while (p.length > 1 && /^(my\d*|(19|20)\d{2}|\d{2}|model)$/.test(p[p.length - 1])) p.pop();
  return p.join("-");
}

function titulo(l: LinkMonitorado, segmento: string): string {
  const t = l.texto.split(/\s+(?:Pre[cç]o|R\$|A partir)/i)[0].trim();
  if (t && !TITULO_GENERICO.test(t)) return t;
  return decodeURIComponent(segmento.replace(/\.html?$/, "")).replace(/-/g, " ");
}

export function linksForaDoCatalogo(
  snapshot: LinkMonitorado[],
  fonte: { url: string; montadoraId: string | null },
  veiculos: Veiculo[],
): LinkMonitorado[] {
  const hostFonte = host(fonte.url);
  const daMarca = veiculos.filter(
    (v) =>
      v.montadoraId === fonte.montadoraId ||
      [v.linkOficialUrl, v.verificadoBrUrl].some((u) => host(u) === hostFonte),
  );
  const urls = new Set(
    daMarca.flatMap((v) => [v.linkOficialUrl, v.verificadoBrUrl]).filter((u): u is string => !!u).map(chaveUrl),
  );
  const nomes = daMarca.map((v) => {
    const marca = new Set([...palavras(v.marca), ...palavras(v.montadoraSlug)]);
    const p = palavras(v.nomeComercial).filter((x) => !marca.has(x));
    return p.length ? p : palavras(v.nomeComercial);
  });
  const anoAtual = new Date().getFullYear();

  // Um item por família, ficando com o ano-modelo mais recente.
  const porFamilia = new Map<string, LinkMonitorado>();
  for (const l of snapshot) {
    let caminho: string;
    try {
      caminho = new URL(l.url).pathname.toLowerCase();
      if (urls.has(chaveUrl(l.url))) continue;
    } catch {
      continue;
    }
    const segmento = caminho.replace(/\/+$/, "").split("/").pop() ?? "";
    if (anoAntigo(caminho, anoAtual) || LISTAGEM.test(segmento.replace(/\.html?$/, ""))) continue;
    const doSegmento = new Set(palavras(segmento));
    if (nomes.some((n) => n.every((p) => doSegmento.has(p)))) continue;
    const chave = `${caminho.slice(0, caminho.lastIndexOf("/"))}/${familia(segmento)}`;
    const atual = porFamilia.get(chave);
    if (!atual || l.url > atual.url) porFamilia.set(chave, { url: l.url, texto: titulo(l, segmento) });
  }
  return [...porFamilia.values()].sort((a, b) => a.texto.localeCompare(b.texto));
}
