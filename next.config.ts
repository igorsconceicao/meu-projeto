import type { NextConfig } from "next";
import { HOSTS_OTIMIZADOS } from "./lib/imagens";

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
  `connect-src 'self' ${SUPABASE}`,
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
    remotePatterns: HOSTS_OTIMIZADOS.map((hostname) => ({ protocol: "https" as const, hostname })),
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

export default nextConfig;
