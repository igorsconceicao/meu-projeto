import type { NextConfig } from "next";

/**
 * Sites cujas fotos passam pelo otimizador de imagens. O otimizador da Vercel
 * atende antes do porteiro de login, então ele só aceita sites conhecidos:
 * a lista é montada a cada deploy a partir do próprio catálogo (fotos e logos
 * cadastrados). Se o banco não responder no build, vale a lista-base abaixo.
 * Foto de um site novo, cadastrada depois do último deploy, carrega direto do
 * site de origem até o próximo deploy (sem quebrar nada).
 */
const HOSTS_BASE = [
  "a.storyblok.com",
  "assets.volkswagen.com",
  "br-www-resouce-cdn.gacgroup.com",
  "carros.peugeot.com.br",
  "cdn.group.renault.com",
  "cms.omodajaecoo.com.br",
  "cmssaladeimprensa.honda.com.br",
  "dynamics365kiasiteblob.kia.com.br",
  "media.mitsubishimotors.com.br",
  "npmsgjpjfflawluyuisl.supabase.co",
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

async function hostsDoCatalogo(): Promise<string[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const segredo = process.env.SITE_CHAVE_CATALOGO;
  if (!url || !chave || !segredo) return [];
  try {
    const resp = await fetch(`${url}/rest/v1/rpc/site_catalogo`, {
      method: "POST",
      headers: { apikey: chave, Authorization: `Bearer ${chave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_chave: segredo }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!resp.ok) return [];
    const catalogo = (await resp.json()) as {
      veiculos: { foto_principal_url: string | null; galeria_urls: string[] | null }[];
      montadoras: { logotipo_url: string | null }[];
    };
    const urls = [
      ...catalogo.veiculos.flatMap((v) => [v.foto_principal_url, ...(v.galeria_urls ?? [])]),
      ...catalogo.montadoras.map((m) => m.logotipo_url),
    ];
    const hosts = new Set<string>();
    for (const u of urls) {
      try {
        const x = new URL(u ?? "");
        if (x.protocol === "https:" && !x.hostname.endsWith("wikimedia.org")) hosts.add(x.hostname);
      } catch {
        // endereço inválido: ignora
      }
    }
    return [...hosts];
  } catch {
    return [];
  }
}

const SUPABASE = "https://npmsgjpjfflawluyuisl.supabase.co";
const dev = process.env.NODE_ENV !== "production";

// O que o navegador pode carregar nesta plataforma. Bloqueia scripts de fora,
// impede que outro site abra o nosso dentro de um quadro (clickjacking) e
// restringe para onde formulários e conexões podem enviar dados.
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${SUPABASE} https://api.pwnedpasswords.com`,
  "frame-src https://www.youtube-nocookie.com https://player.vimeo.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [], // preenchido no build (ver configuracao abaixo)
    // Poucas larguras = menos versões geradas de cada foto (mais rápido e dentro da cota gratuita).
    deviceSizes: [640, 828, 1200],
    imageSizes: [96, 320, 420],
    formats: ["image/webp"],
    minimumCacheTTL: 2_678_400, // 31 dias
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/admin/login", destination: "/entrar", permanent: true },
      { source: "/admin/trocar-senha", destination: "/trocar-senha", permanent: true },
    ];
  },
};

export default async function configuracao(): Promise<NextConfig> {
  const doCatalogo = await hostsDoCatalogo();
  const hosts = [...new Set([...HOSTS_BASE, ...doCatalogo])].sort();
  console.log(`[fotos] otimizador aceita ${hosts.length} sites (${doCatalogo.length} lidos do catálogo)`);
  return {
    ...nextConfig,
    images: {
      ...nextConfig.images,
      remotePatterns: hosts.map((hostname) => ({ protocol: "https" as const, hostname })),
    },
  };
}
