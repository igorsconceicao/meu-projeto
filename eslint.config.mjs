import nextConfig from "eslint-config-next";

// supabase/functions roda em Deno (Edge Functions), fora do build do Next.js.
const config = [...nextConfig, { ignores: ["supabase/**"] }];

export default config;
