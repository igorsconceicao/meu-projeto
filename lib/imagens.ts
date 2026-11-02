/**
 * Fotos oficiais que passam pelo otimizador de imagens da Vercel: ela baixa a
 * foto do site da montadora uma vez, reduz para o tamanho exibido, converte
 * para WebP e guarda por 31 dias. Uma foto de 2–4 MB vira ~30–80 KB no card.
 *
 * Host fora desta lista continua carregando direto do site de origem.
 * Wikimedia Commons já entrega no tamanho pedido (parâmetro width), então não
 * precisa do otimizador.
 */
export const HOSTS_OTIMIZADOS = [
  "a.storyblok.com",
  "assets.volkswagen.com",
  "br-www-resouce-cdn.gacgroup.com",
  "carros.peugeot.com.br",
  "cdn.group.renault.com",
  "cms.omodajaecoo.com.br",
  "cmssaladeimprensa.honda.com.br",
  "dynamics365kiasiteblob.kia.com.br",
  "media.mitsubishimotors.com.br",
  "static.autodromo.com.br",
  "www.byd.com",
  "www.caoa.com.br",
  "www.chevrolet.com.br",
  "www.datocms-assets.com",
  "www.denza.com",
  "www.ford.com.br",
  "www.gwmmotors.com.br",
  "www.hyundai.com.br",
  "www.jacmotors.com.br",
  "www.landrover.com.br",
  "www.leapmotor.com.br",
  "www.lexus.com.br",
  "www.media.stellantis.com",
  "www.mini.com.br",
  "www.nissan-cdn.net",
  "www.omodajaecoo.com.br",
  "www.renault.com.br",
];

const OTIMIZADOS = new Set(HOSTS_OTIMIZADOS);

function host(url: string): string | null {
  try {
    const u = new URL(url);
    return u.protocol === "https:" ? u.hostname : null;
  } catch {
    return null;
  }
}

export function podeOtimizar(url: string): boolean {
  const h = host(url);
  return !!h && OTIMIZADOS.has(h);
}

/** Larguras que o Commons já tem prontas (pedir outras deixa a foto mais lenta). */
const LARGURAS_COMMONS = [120, 330, 500, 960, 1280];

/** Pede ao Wikimedia Commons a foto já na largura exibida (em vez de 1280 px sempre). */
export function urlCommons(url: string, largura: number): string {
  const h = host(url);
  if (h !== "commons.wikimedia.org" && h !== "upload.wikimedia.org") return url;
  const alvo = LARGURAS_COMMONS.find((l) => l >= largura) ?? 1280;
  const u = new URL(url);
  if (u.pathname.includes("/Special:FilePath/")) {
    u.searchParams.set("width", String(alvo));
    return u.toString();
  }
  return url.replace(/\/(\d+)px-([^/]+)$/, (m, px, nome) => (Number(px) > alvo ? `/${alvo}px-${nome}` : m));
}
