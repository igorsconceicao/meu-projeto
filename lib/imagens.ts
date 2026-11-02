/**
 * Fotos dos sites oficiais passam pelo otimizador de imagens da Vercel: ela
 * baixa a foto da montadora uma vez, reduz para o tamanho exibido, converte
 * para WebP e guarda por 31 dias. Vale para qualquer site (inclusive os que a
 * rotina de pesquisa cadastrar no futuro). O otimizador só atende quem está
 * logado (ver proxy.ts), então ninguém de fora consegue usá-lo.
 *
 * Wikimedia Commons fica de fora: ele já entrega no tamanho pedido (width).
 */
function host(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.hostname : null;
  } catch {
    return null;
  }
}

const COMMONS = new Set(["commons.wikimedia.org", "upload.wikimedia.org"]);

export function podeOtimizar(url: string): boolean {
  const h = host(url);
  return !!h && !COMMONS.has(h) && !url.toLowerCase().split("?")[0].endsWith(".svg");
}

/** Larguras que o Commons já tem prontas (pedir outras deixa a foto mais lenta). */
const LARGURAS_COMMONS = [120, 330, 500, 960, 1280];

/** Pede ao Wikimedia Commons a foto já na largura exibida (em vez de 1280 px sempre). */
export function urlCommons(url: string, largura: number): string {
  const h = host(url);
  if (!h || !COMMONS.has(h)) return url;
  const alvo = LARGURAS_COMMONS.find((l) => l >= largura) ?? 1280;
  const u = new URL(url);
  if (u.pathname.includes("/Special:FilePath/")) {
    u.searchParams.set("width", String(alvo));
    return u.toString();
  }
  return url.replace(/\/(\d+)px-([^/]+)$/, (m, px, nome) => (Number(px) > alvo ? `/${alvo}px-${nome}` : m));
}
