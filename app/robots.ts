import type { MetadataRoute } from "next";

/** Plataforma interna: nenhum buscador deve indexar nada. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
