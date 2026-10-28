// Pesquisa somente-leitura usada na curadoria de mídia, na verificação de
// comercialização no Brasil e na coleta de dados técnicos. Não grava nada.
//
// POST { acao: "pagina", paginas: [{ id, url, palavras?: string[] }] }
//   → título, og:image, canonical, links e imagens que contêm as palavras.
// POST { acao: "trechos", paginas: [{ id, url, palavras: string[], raio?, max? }] }
//   → trechos de texto ao redor de cada palavra (ficha técnica, multimídia...).
//   Aceita também PDFs (fichas técnicas oficiais): o texto é extraído com unpdf.
// POST { acao: "texto", paginas: [{ id, url, inicio?, tamanho?, dados? }] }
//   → um pedaço contínuo do texto (páginas longas e PDFs, como o informativo da Fenabrave);
//   com dados: true inclui o JSON embutido na página (versões e preços montados no navegador).
// POST { acao: "youtube", buscas: [{ id, termo, limite? }] }
//   → vídeos da busca do YouTube (id, título, canal, link). Título e descrição de
//   um vídeo saem com "pagina"/"trechos" na URL do vídeo (descrição vai em [d]).
// POST { acao: "html", paginas: [{ id, url, inicio?, tamanho? }] }
//   → um pedaço do HTML/JS bruto (para achar a API de catálogos que montam a página no navegador).
// POST { acao: "imagens", imagens: [{ id, url }] }
//   → status, tipo, tamanho e dimensões de cada foto cadastrada (confere se abre).
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
  "porsche.com", // newsroom e páginas /brazil da Porsche
  "bmwgroup.com", // sala de imprensa da BMW e da MINI (press.bmwgroup.com/brazil)
  "youtube.com", // vídeos de lançamento e avaliações (título, canal e descrição)
  // Salas de imprensa globais oficiais, para modelos que a imprensa brasileira não detalha
  "mercedes-benz.com",
  "daimler.com",
  "mbusa.com",
  "audi-mediacenter.com",
  "audiusa.com",
  "ford.com",
  "volkswagen-newsroom.com",
  "toyota.com",
  "toyota-europe.com",
  "lexus.com",
  "mitsubishi-motors.com",
  "nissan-global.com",
  "nissannews.com",
  // CDNs de imagem dos sites oficiais (só para conferir se as fotos cadastradas abrem)
  "volkswagen.com",
  "datocms-assets.com",
  "storyblok.com",
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
    const bytes = new Uint8Array(await res.arrayBuffer());
    return { status: res.status, finalUrl: res.url, html: decodificarBytes(bytes, tipo).slice(0, 4_000_000), pdf: false };
  } catch (e: any) {
    return { erro: String(e?.message ?? e) };
  } finally {
    clearTimeout(t);
  }
}

/** Decodifica no charset da página (header ou <meta>); muitos portais ainda usam ISO-8859-1. */
function decodificarBytes(bytes: Uint8Array, contentType: string): string {
  let charset = contentType.match(/charset=["']?([\w-]+)/i)?.[1];
  if (!charset) {
    const cabeca = new TextDecoder("latin1").decode(bytes.slice(0, 4096));
    charset = cabeca.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  }
  try {
    return new TextDecoder((charset ?? "utf-8").toLowerCase()).decode(bytes);
  } catch {
    return new TextDecoder("utf-8").decode(bytes);
  }
}

const ENTIDADES: Record<string, string> = {
  nbsp: " ", amp: "&", quot: '"', apos: "'", lt: "<", gt: ">",
  aacute: "á", Aacute: "Á", agrave: "à", Agrave: "À", acirc: "â", Acirc: "Â", atilde: "ã", Atilde: "Ã",
  eacute: "é", Eacute: "É", ecirc: "ê", Ecirc: "Ê", iacute: "í", Iacute: "Í",
  oacute: "ó", Oacute: "Ó", ocirc: "ô", Ocirc: "Ô", otilde: "õ", Otilde: "Õ",
  uacute: "ú", Uacute: "Ú", uuml: "ü", Uuml: "Ü", ccedil: "ç", Ccedil: "Ç",
  ordm: "º", ordf: "ª", deg: "°", reg: "®", trade: "™", copy: "©", sup2: "²", sup3: "³",
  ndash: "–", mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  laquo: "«", raquo: "»", bull: "•", middot: "·", times: "×", frac12: "½",
};

function decodificar(s: string): string {
  return s
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, nome) => ENTIDADES[nome] ?? m)
    .replace(/&#39;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
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
  // Página de vídeo do YouTube: título, canal e descrição ficam no ytInitialPlayerResponse.
  const yt = (chave: string) => html.match(new RegExp(`"${chave}":"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
  const descricaoYt = yt("shortDescription");
  if (descricaoYt !== undefined) {
    const json = (s?: string) => { try { return JSON.parse(`"${s ?? ""}"`) as string; } catch { return s ?? ""; } };
    dados.push(`Vídeo: ${json(yt("title"))} | Canal: ${json(yt("author") ?? yt("ownerChannelName"))} | Publicado: ${yt("publishDate") ?? ""} | Descrição: ${json(descricaoYt)}`);
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

async function buscarTexto(p: { id: string; url: string; inicio?: number; tamanho?: number; dados?: boolean }) {
  const r = await baixar(p.url);
  if ("erro" in r) return { id: p.id, ...r };
  const t = r.pdf ? null : textos(r.html);
  // dados: true junta o JSON embutido (sites que montam versões e preços no navegador).
  const texto = t ? (p.dados && t.dados ? `${t.visivel} || DADOS: ${t.dados}` : t.visivel) : r.html.replace(/\s+/g, " ").trim();
  const inicio = Math.max(0, p.inicio ?? 0);
  const tamanho = Math.min(p.tamanho ?? 50_000, 200_000);
  return {
    id: p.id,
    status: r.status,
    finalUrl: r.finalUrl,
    tamanhoTexto: texto.length,
    inicio,
    texto: texto.slice(inicio, inicio + tamanho),
  };
}

async function buscarHtml(p: { id: string; url: string; inicio?: number; tamanho?: number }) {
  const r = await baixar(p.url);
  if ("erro" in r) return { id: p.id, ...r };
  const inicio = Math.max(0, p.inicio ?? 0);
  const tamanho = Math.min(p.tamanho ?? 50_000, 200_000);
  return { id: p.id, status: r.status, finalUrl: r.finalUrl, tamanhoHtml: r.html.length, inicio, html: r.html.slice(inicio, inicio + tamanho) };
}

/** Busca no YouTube: lista de vídeos com título e canal (do ytInitialData da página de resultados). */
async function buscarYoutube(b: { id: string; termo: string; limite?: number }) {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(b.termo)}&hl=pt-BR&gl=BR`;
  const r = await baixar(url);
  if ("erro" in r) return { id: b.id, ...r };
  const lim = Math.min(b.limite ?? 8, 20);
  const videos: { video: string; titulo: string; canal: string | null; publicado: string | null; url: string }[] = [];
  const texto = (s?: string) => { try { return JSON.parse(`"${s ?? ""}"`) as string; } catch { return s ?? ""; } };
  for (const m of r.html.matchAll(/"videoRenderer":\{"videoId":"([\w-]{11})"/g)) {
    if (videos.some((v) => v.video === m[1])) continue;
    const bloco = r.html.slice(m.index!, m.index! + 6000);
    const titulo = bloco.match(/"title":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)?.[1];
    if (!titulo) continue;
    videos.push({
      video: m[1],
      titulo: texto(titulo),
      canal: texto(bloco.match(/"ownerText":\{"runs":\[\{"text":"((?:[^"\\]|\\.)*)"/)?.[1]) || null,
      publicado: bloco.match(/"publishedTimeText":\{"simpleText":"([^"]*)"/)?.[1] ?? null,
      url: `https://www.youtube.com/watch?v=${m[1]}`,
    });
    if (videos.length >= lim) break;
  }
  return { id: b.id, termo: b.termo, status: r.status, videos };
}

/** Largura e altura lidas do cabeçalho do arquivo (JPEG, PNG, GIF, WebP e AVIF). */
function dimensoes(b: Uint8Array): { w: number; h: number; formato: string } | null {
  const be16 = (i: number) => (b[i] << 8) | b[i + 1];
  const le16 = (i: number) => b[i] | (b[i + 1] << 8);
  const le24 = (i: number) => b[i] | (b[i + 1] << 8) | (b[i + 2] << 16);
  const be32 = (i: number) => ((b[i] << 24) >>> 0) + ((b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]);
  const ascii = (i: number, n: number) => String.fromCharCode(...b.slice(i, i + n));
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") return { w: be32(16), h: be32(20), formato: "png" };
  if (ascii(0, 3) === "GIF") return { w: le16(6), h: le16(8), formato: "gif" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    const c = ascii(12, 4);
    if (c === "VP8 ") return { w: le16(26) & 0x3fff, h: le16(28) & 0x3fff, formato: "webp" };
    if (c === "VP8L") {
      return { w: 1 + (((b[22] & 0x3f) << 8) | b[21]), h: 1 + (((b[24] & 0xf) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6)), formato: "webp" };
    }
    if (c === "VP8X") return { w: 1 + le24(24), h: 1 + le24(27), formato: "webp" };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length && b[i] === 0xff) {
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: be16(i + 7), h: be16(i + 5), formato: "jpeg" };
      i += 2 + be16(i + 2);
    }
  }
  for (let i = 4; i + 16 < Math.min(b.length, 4096); i++) {
    if (ascii(i, 4) === "ispe") return { w: be32(i + 8), h: be32(i + 12), formato: "avif" };
  }
  return null;
}

/** Confere se uma foto cadastrada abre: status, tipo, tamanho e dimensões (lê só o começo do arquivo). */
async function conferirImagem(p: { id: string; url: string }) {
  if (!hostPermitido(p.url)) return { id: p.id, erro: "dominio-nao-permitido" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(p.url, { headers: { "User-Agent": UA, "Accept": "image/*,*/*" }, redirect: "follow", signal: ctrl.signal });
    const tipo = res.headers.get("content-type");
    const tamanho = res.headers.get("content-length");
    const partes: Uint8Array[] = [];
    let lidos = 0;
    const leitor = res.body?.getReader();
    while (leitor && lidos < 262_144) {
      const { done, value } = await leitor.read();
      if (done) break;
      partes.push(value);
      lidos += value.byteLength;
    }
    await leitor?.cancel();
    const inicio = new Uint8Array(lidos);
    let pos = 0;
    for (const parte of partes) { inicio.set(parte, pos); pos += parte.byteLength; }
    return { id: p.id, status: res.status, tipo, tamanho: tamanho ? Number(tamanho) : null, ...dimensoes(inicio), finalUrl: res.url };
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
  } else if (body.acao === "trechos") {
    resultado = await emLotes(body.paginas ?? [], 6, buscarTrechos);
  } else if (body.acao === "texto") {
    resultado = await emLotes(body.paginas ?? [], 3, buscarTexto);
  } else if (body.acao === "html") {
    resultado = await emLotes(body.paginas ?? [], 3, buscarHtml);
  } else if (body.acao === "youtube") {
    resultado = await emLotes(body.buscas ?? [], 3, buscarYoutube);
  } else if (body.acao === "imagens") {
    resultado = await emLotes(body.imagens ?? [], 8, conferirImagem);
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
