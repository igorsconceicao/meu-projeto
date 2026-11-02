import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { Linha, Tabela } from "@/lib/dados/tecnicos";

/**
 * Catálogo inteiro (marcas, modelos e dados técnicos resumidos) numa única
 * chamada ao banco. A função site_catalogo só responde a quem apresenta a
 * chave secreta guardada no servidor da Vercel (SITE_CHAVE_CATALOGO) — o
 * navegador nunca vê essa chave. O resultado fica guardado por 10 minutos e é
 * renovado na hora sempre que o admin salva algo (etiqueta "catalogo").
 *
 * Quem chama precisa conferir o login antes (ver lib/auth/sessao.ts).
 */
export type CatalogoBruto = {
  montadoras: Record<string, unknown>[];
  veiculos: Record<string, unknown>[];
} & Partial<Record<Tabela, Linha[]>>;

export const ETIQUETA_CATALOGO = "catalogo";

export const lerCatalogo = unstable_cache(
  async (): Promise<CatalogoBruto> => {
    const chave = process.env.SITE_CHAVE_CATALOGO;
    if (!chave) throw new Error("Configuração ausente: SITE_CHAVE_CATALOGO.");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
    const { data, error } = await supabase.rpc("site_catalogo", { p_chave: chave });
    if (error) throw new Error(`Catálogo indisponível: ${error.message}`);
    return data as CatalogoBruto;
  },
  ["catalogo-v1"],
  { revalidate: 600, tags: [ETIQUETA_CATALOGO] },
);
