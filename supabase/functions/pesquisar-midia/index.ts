// Pesquisa somente-leitura usada na curadoria de mídia, na verificação de
// comercialização no Brasil e na coleta de dados técnicos. Não grava nada.
//
// POST { acao: "pagina", paginas: [{ id, url, palavras?: string[] }] }
//   → título, og:image, canonical, links e imagens que contêm as palavras.
// POST { acao: "trechos", paginas: [{ id, url, palavras: string[], raio?, max? }] }
//   → trechos de texto ao redor de cada palavra (ficha técnica, multimídia...).
//   Aceita também PDFs (fichas técnicas oficiais): o texto é extraído com unpdf.
// POST { acao: "commons", consultas: [{ id, termo, limite? }] }
// POST { acao: "commons-categoria", categorias: [{ id, categoria, limite? }] }
//   → arquivos do Wikimedia Commons com autor, licença, descrição e categorias.
//
// Requer o header x-chave-interna (valor em public.chaves_internas).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UA =
  "InteligenciaAutomotivaBR/1.0 (+https://github.com/igorsconceicao/meu-projeto)";

// Domínios globais de montadoras com páginas brasileiras fora de .com.br.
const DOMINIOS_GLOBAIS = [
  "wikimedia.org",
  "wikipedia.org",
  "wikidata.org",
  "byd.com",
  "denza.com",
  "stellantis.com",
  "volvocars.com",
  "group.renault.com", // CDN oficial do Grupo Renault (catálogos e manuais em PDF)
  "nissan-cdn.net",
  "gacmotor.com",
  "gac-motor.com",
  "gacinternational.com",
  "gacgroup.com",
  "omodajaecoo.com",
  "omodaauto.com",
  "jaecoo.com",
  "leapmotor.com",
  "leapmotor-international.com",
  "geely.com",
  "geelyauto.com",
  "zeekr.com",
  "zeekrlife.com",
  "xpeng.com",
  "heyxpeng.com",
  "changan.com",
  "changanauto.com",
  "mgmotor.com",
  "kia.com",
];

function hostPermitido(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (/^[\d.]+$/.test(h) || h.includes(":") || h === "localhost") return false;
    if (h.endsWith(".com.br") || h.endsWith(".br")) return true;
    return DOMINIOS_GLOBAIS.some((d) => h === d || h.endsWith("." + d));
  } catch {
    return false;
  }
}

function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function meta(html: string, prop: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${prop}["']`,
    "i",
  );
  const m = html.match(re);
  return m ? (m[1] ?? m[2] ?? null) : null;
}

type Baixado = { status: number; finalUrl: string; html: string; pdf: boolean };

async function textoDoPdf(bytes: Uint8Array): Promise<string> {
  const { extractText, getDocumentProxy } = await import("npm:unpdf@1.4.0");
  const doc = await getDocumentProxy(bytes);
  const { text } = await extractText(doc, { mergePages: true });
  return Array.isArray(text) ? text.join(" | ") : text;
}

async function baixar(url: string): Promise<Baixado | { erro: string; status?: number; finalUrl?: string }> {
  if (!hostPermitido(url)) return { erro: "dominio-nao-permitido" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/pdf,*/*" },
      redirect: "follow",
      signal: ctrl.signal,
    });
    if (!hostPermitido(res.url)) {
      return { erro: "redirecionou-para-fora", status: res.status, finalUrl: res.url };
    }
    const tipo = res.headers.get("content-type") ?? "";
    if (tipo.includes("pdf") || /\.pdf(?:$|\?)/i.test(res.url)) {
      const bytes = new Uint8Array(await res.arrayBuffer());
      if (bytes.byteLength > 15_000_000) return { erro: "pdf-grande-demais", status: res.status, finalUrl: res.url };
      const texto = await textoDoPdf(bytes);
      return { status: res.status, finalUrl: res.url, html: texto.slice(0, 2_000_000), pdf: true };
    }
    return { status: res.status, finalUrl: res.url, html: (await res.text()).slice(0, 4_000_000), pdf: false };
  } catch (e: any) {
    return { erro: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

function decodificar(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
    .replace(/\\u([0-9a-fA-F]{4})/g, (_m, h) => String.fromCharCode(parseInt(h, 16)));
}

/** Texto visível + conteúdo de scripts de dados (JSON/__NEXT_DATA__/ld+json). */
function textos(html: string): { visivel: string; dados: string } {
  const dados: string[] = [];
  for (const m of html.matchAll(/<script[^>]*(?:type=["']application\/(?:ld\+)?json["']|id=["']__NEXT_DATA__["'])[^>]*>([\s\S]*?)<\/script>/gi)) {
    dados.push(m[1]);
  }
  for (const m of html.matchAll(/self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g)) {
    dados.push(m[1]);
  }
  const visivel = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<(br|\/p|\/li|\/td|\/th|\/tr|\/h\d|\/div)[^>]*>/gi, " | ")
    .replace(/<[^>]+>/g, " ");
  const limpa = (s: string) => decodificar(s).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { visivel: limpa(visivel), dados: limpa(dados.join(" | ")) };
}

async function buscarPagina(p: { id: string; url: string; palavras?: string[] }) {
  const r = await baixar(p.url);
  if ("erro" in r) return { id: p.id, ...r };
  const { html, finalUrl, status } = r;
  const titulo = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
  const canonical =
    html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null;

  const palavras = (p.palavras ?? []).map(semAcento).filter(Boolean);
  const contem = (s: string) => {
    const n = semAcento(s);
    return palavras.length === 0 || palavras.some((w) => n.includes(w));
  };

  const links = new Set<string>();
  for (const m of html.matchAll(/(?:href=["']([^"'#]+)["']|<loc>\s*([^<\s]+)\s*<\/loc>)/gi)) {
    try {
      const abs = new URL(m[1] ?? m[2], finalUrl).toString();
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

  const { visivel } = textos(html);
  const texto = semAcento(visivel);
  const ocorrencias: Record<string, number> = {};
  for (const w of palavras) ocorrencias[w] = texto.split(w).length - 1;

  return {
    id: p.id,
    status,
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
}

async function buscarTrechos(p: { id: string; url: string; palavras: string[]; raio?: number; max?: number }) {
  const r = await baixar(p.url);
  if ("erro" in r) return { id: p.id, ...r };
  const raio = Math.min(p.raio ?? 140, 400);
  const max = Math.min(p.max ?? 4, 12);
  const { visivel, dados } = r.pdf
    ? { visivel: r.html.replace(/\s+/g, " ").trim(), dados: "" }
    : textos(r.html);
  const resultado: Record<string, string[]> = {};
  for (const [origem, texto] of [["v", visivel], ["d", dados]] as const) {
    const norm = semAcento(texto);
    for (const palavra of p.palavras) {
      const w = semAcento(palavra);
      if (!w) continue;
      const lista = (resultado[palavra] ??= []);
      let i = norm.indexOf(w);
      while (i !== -1 && lista.length < max) {
        const ini = Math.max(0, i - raio);
        const trecho = texto.slice(ini, i + w.length + raio);
        if (!lista.some((t) => t.includes(trecho.slice(raio - 10, raio + w.length + 10)))) {
          lista.push(`[${origem}] ${trecho}`);
        }
        i = norm.indexOf(w, i + w.length + raio);
      }
    }
  }
  return {
    id: p.id,
    status: r.status,
    finalUrl: r.finalUrl,
    titulo: r.pdf ? "(PDF)" : r.html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null,
    tamanhoTexto: visivel.length,
    tamanhoDados: dados.length,
    trechos: resultado,
  };
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
  } else if (body.acao === "trechos") {
    resultado = await emLotes(body.paginas ?? [], 6, buscarTrechos);
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
