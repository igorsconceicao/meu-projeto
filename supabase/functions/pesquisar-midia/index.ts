// Pesquisa somente-leitura usada na curadoria de mídia e na verificação de
// comercialização no Brasil. Não grava nada no banco.
//
// POST { acao: "pagina", paginas: [{ id, url, palavras?: string[] }] }
//   → título, og:image, canonical, links e imagens que contêm as palavras.
// POST { acao: "commons", consultas: [{ id, termo, limite? }] }
// POST { acao: "commons-categoria", categorias: [{ id, categoria, limite? }] }
//   → arquivos do Wikimedia Commons com autor, licença, descrição e categorias.
//
// Requer o header x-chave-interna (valor em public.chaves_internas).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UA =
  "InteligenciaAutomotivaBR/1.0 (+https://github.com/igorsconceicao/meu-projeto)";

const DOMINIOS_PERMITIDOS = [
  "wikimedia.org",
  "wikipedia.org",
  "wikidata.org",
  "byd.com",
  "caoachery.com.br",
  "chevrolet.com.br",
  "citroen.com.br",
  "fiat.com.br",
  "ford.com.br",
  "gwmmotors.com.br",
  "gwm.com.br",
  "honda.com.br",
  "hyundai.com.br",
  "jacmotors.com.br",
  "jeep.com.br",
  "mitsubishimotors.com.br",
  "nissan.com.br",
  "peugeot.com.br",
  "ram.com.br",
  "renault.com.br",
  "toyota.com.br",
  "vw.com.br",
  "volvocars.com",
];

function hostPermitido(url: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return DOMINIOS_PERMITIDOS.some((d) => h === d || h.endsWith("." + d));
  } catch {
    return false;
  }
}

function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function meta(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

async function buscarPagina(p: { id: string; url: string; palavras?: string[] }) {
  if (!hostPermitido(p.url)) return { id: p.id, erro: "dominio-nao-permitido" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(p.url, {
      headers: { "User-Agent": UA, "Accept": "text/html,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    const finalUrl = res.url;
    if (!hostPermitido(finalUrl)) {
      return { id: p.id, status: res.status, finalUrl, erro: "redirecionou-para-fora" };
    }
    const html = (await res.text()).slice(0, 4_000_000);
    const titulo = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
    const canonical =
      html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;

    const palavras = (p.palavras ?? []).map(semAcento).filter(Boolean);
    const contem = (s: string) => {
      const n = semAcento(s);
      return palavras.length === 0 || palavras.some((w) => n.includes(w));
    };

    const links = new Set<string>();
    for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) {
      try {
        const abs = new URL(m[1], finalUrl).toString();
        if (contem(abs)) links.add(abs);
      } catch { /* ignora */ }
      if (links.size >= 40) break;
    }

    const imagens = new Set<string>();
    for (const m of html.matchAll(/(?:src|data-src|srcset|content)=["']([^"']+\.(?:jpe?g|png|webp|avif)[^"'\s]*)/gi)) {
      try {
        const abs = new URL(m[1].split(/\s+/)[0], finalUrl).toString();
        if (contem(abs)) imagens.add(abs);
      } catch { /* ignora */ }
      if (imagens.size >= 25) break;
    }

    const texto = semAcento(html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " "));
    const ocorrencias: Record<string, number> = {};
    for (const w of palavras) ocorrencias[w] = texto.split(w).length - 1;

    return {
      id: p.id,
      status: res.status,
      finalUrl,
      titulo,
      canonical,
      ogTitle: meta(html, "og:title"),
      ogImage: meta(html, "og:image"),
      descricao: meta(html, "description")?.slice(0, 300) ?? null,
      ocorrencias,
      links: [...links],
      imagens: [...imagens],
    };
  } catch (e: any) {
    return { id: p.id, erro: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

function limpar(s: unknown, max: number): string | null {
  if (typeof s !== "string") return null;
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max) || null;
}

function mapearArquivos(data: any) {
  const pages = Object.values(data?.query?.pages ?? {}) as any[];
  return pages
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((pg) => {
      const ii = pg.imageinfo?.[0] ?? {};
      const em = ii.extmetadata ?? {};
      return {
        titulo: pg.title,
        url: ii.url ?? null,
        thumb: ii.thumburl ?? null,
        w: ii.width ?? null,
        h: ii.height ?? null,
        autor: limpar(em.Artist?.value, 80),
        licenca: em.LicenseShortName?.value ?? null,
        data: limpar(em.DateTimeOriginal?.value, 40) ?? ii.timestamp ?? null,
        desc: limpar(em.ImageDescription?.value, 180),
        cats: limpar(em.Categories?.value, 260),
      };
    });
}

const IIPROP =
  "prop=imageinfo&iiprop=url|size|timestamp|extmetadata&iiurlwidth=800" +
  "&iiextmetadatafilter=Artist|LicenseShortName|ImageDescription|Categories|DateTimeOriginal";

async function commonsBusca(c: { id: string; termo: string; limite?: number }) {
  const lim = Math.min(c.limite ?? 8, 20);
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search` +
    `&gsrnamespace=6&gsrlimit=${lim}&gsrsearch=${encodeURIComponent(c.termo)}&${IIPROP}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    return { id: c.id, termo: c.termo, arquivos: mapearArquivos(await res.json()) };
  } catch (e: any) {
    return { id: c.id, erro: String(e?.message ?? e) };
  }
}

async function commonsCategoria(c: { id: string; categoria: string; limite?: number }) {
  const lim = Math.min(c.limite ?? 15, 40);
  const cat = c.categoria.startsWith("Category:") ? c.categoria : `Category:${c.categoria}`;
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers` +
    `&gcmtype=file&gcmlimit=${lim}&gcmsort=timestamp&gcmdir=desc&gcmtitle=${encodeURIComponent(cat)}&${IIPROP}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    return { id: c.id, categoria: cat, arquivos: mapearArquivos(await res.json()) };
  } catch (e: any) {
    return { id: c.id, erro: String(e?.message ?? e) };
  }
}

async function emLotes<T, R>(itens: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < itens.length; i += n) {
    out.push(...(await Promise.all(itens.slice(i, i + n).map(fn))));
  }
  return out;
}

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: chave } = await supabase
    .from("chaves_internas")
    .select("valor")
    .eq("nome", "pesquisa-midia")
    .maybeSingle();
  if (!chave?.valor || req.headers.get("x-chave-interna") !== chave.valor) {
    return new Response(JSON.stringify({ erro: "nao-autorizado" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  let resultado: unknown;
  if (body.acao === "pagina") {
    resultado = await emLotes(body.paginas ?? [], 6, buscarPagina);
  } else if (body.acao === "commons") {
    resultado = await emLotes(body.consultas ?? [], 4, commonsBusca);
  } else if (body.acao === "commons-categoria") {
    resultado = await emLotes(body.categorias ?? [], 4, commonsCategoria);
  } else {
    return new Response(JSON.stringify({ erro: "acao-invalida" }), { status: 400 });
  }
  return new Response(JSON.stringify(resultado), {
    headers: { "content-type": "application/json" },
  });
});
