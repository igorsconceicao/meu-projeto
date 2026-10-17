// Monitoramento semanal de novidades nos sites oficiais das montadoras. Não
// usa IA: lê o HTML, guarda os links de páginas de modelo e compara com a
// leitura anterior. Também confere se a página oficial de cada modelo do
// catálogo continua no ar. Tudo vira item de revisão em monitor_novidades;
// nada é publicado automaticamente.
//
// POST {}                     → sites + páginas dos modelos
// POST { acao: "sites" }      → só as páginas de marca (monitor_fontes)
// POST { acao: "paginas" }    → só as páginas oficiais dos modelos
// POST { dryRun: true }       → não grava nada
// POST { acao: "inspecionar", url, filtro? } → mostra os caminhos que a página
//                                (ou sitemap) traz, para configurar uma fonte
//
// Cada fonte (monitor_fontes) é uma página HTML ou um sitemap XML declarado no
// robots.txt do site, com um padrão opcional (regex do caminho) que identifica
// as páginas de modelo daquele site.
//
// Requer o header x-chave-interna (valor em public.chaves_internas).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UA = "InteligenciaAutomotivaBR/1.0 (+https://github.com/igorsconceicao/meu-projeto)";

// Trechos de caminho típicos de página de modelo nos sites brasileiros.
const PARECE_MODELO =
  /\/(modelos?|carros?|car|veiculos?|veiculos-de-passeio|utilitarios|suvs?|suvs-e-crossovers|picapes?|hatch(back)?|sedan|sedans|eletricos?|hibridos?|gama|configuration|vehicles?)\/[a-z0-9]/;
// Páginas que não são de modelo (ofertas, serviços, institucional…).
const NAO_E_MODELO =
  /(oferta|promo|consorcio|financ|seguro|blog|noticia|imprensa|test-?drive|concession|revend|pos-venda|servico|revis|recall|acessorio|manual|contato|faq|privacidade|cookie|trabalhe|carreira|frota|vendas-diretas|pcd|garantia|compare|comparar|monte|configurador|simul|agend|login|cadastro|reserv|legado|heritage|guias?(?:\/|$)|comprar|\.pdf$|\.jpe?g$|\.png$)/;

type Link = { url: string; texto: string };

function normalizarUrl(u: URL): string {
  const caminho = u.pathname.replace(/\/+$/, "").replace(/\.html?$/, "").toLowerCase();
  return `${u.protocol}//${u.host.replace(/^www\./, "")}${caminho}`;
}

function textoLimpo(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

/** Título legível do link: corta preço grudado no texto e troca textos genéricos pelo caminho. */
function tituloDoLink(texto: string, caminho: string): string {
  const t = texto.split(/\s+(?:Pre[cç]o|R\$|A partir)/i)[0].trim();
  if (t && !/^(explore|saiba|conhe[cç]a|veja|ver|descubra|clique|mais)\b/i.test(t)) return t.slice(0, 120);
  const ultimo = caminho.replace(/\/+$/, "").split("/").pop() ?? "";
  return decodeURIComponent(ultimo).replace(/\.html?$/, "").replace(/-/g, " ");
}

async function baixar(url: string, ms = 20000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
      signal: ctrl.signal,
      redirect: "follow",
    });
  } finally {
    clearTimeout(t);
  }
}

function ePaginaDeModelo(caminho: string, padrao: RegExp | null): boolean {
  const c = caminho.toLowerCase();
  return (padrao ? padrao.test(c) : PARECE_MODELO.test(c)) && !NAO_E_MODELO.test(c);
}

/** Links de páginas de modelo no mesmo site da fonte (HTML). */
function extrairLinks(html: string, base: string, padrao: RegExp | null): Link[] {
  const baseUrl = new URL(base);
  const host = baseUrl.host.replace(/^www\./, "");
  const vistos = new Map<string, Link>();
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u: URL;
    try {
      u = new URL(m[1].trim(), baseUrl);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(u.protocol) || u.host.replace(/^www\./, "") !== host) continue;
    if (!ePaginaDeModelo(u.pathname, padrao)) continue;
    const chave = normalizarUrl(u);
    if (chave === normalizarUrl(baseUrl)) continue;
    const texto = tituloDoLink(textoLimpo(m[2]), u.pathname);
    const atual = vistos.get(chave);
    if (!atual || (!atual.texto && texto)) vistos.set(chave, { url: `${u.origin}${u.pathname}`, texto });
  }
  return [...vistos.values()].sort((a, b) => a.url.localeCompare(b.url));
}

/** Páginas de modelo listadas num sitemap XML (segue índices de sitemap do mesmo site). */
async function linksDoSitemap(url: string, padrao: RegExp | null): Promise<Link[]> {
  const host = new URL(url).host.replace(/^www\./, "");
  const fila = [url];
  const lidos = new Set<string>();
  const vistos = new Map<string, Link>();
  while (fila.length && lidos.size < 15) {
    const atual = fila.shift()!;
    if (lidos.has(atual)) continue;
    lidos.add(atual);
    const res = await baixar(atual);
    if (!res.ok) {
      if (atual === url) throw new Error(`HTTP ${res.status}`);
      continue;
    }
    const xml = await res.text();
    const indice = /<sitemapindex/i.test(xml);
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      let u: URL;
      try {
        u = new URL(m[1].replace(/&amp;/g, "&"));
      } catch {
        continue;
      }
      if (u.host.replace(/^www\./, "") !== host) continue;
      if (indice) fila.push(u.href);
      else if (ePaginaDeModelo(u.pathname, padrao)) {
        vistos.set(normalizarUrl(u), { url: `${u.origin}${u.pathname}`, texto: tituloDoLink("", u.pathname) });
      }
    }
  }
  return [...vistos.values()].sort((a, b) => a.url.localeCompare(b.url));
}

async function emLotes<T, R>(itens: T[], tamanho: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    out.push(...(await Promise.all(itens.slice(i, i + tamanho).map(fn))));
  }
  return out;
}

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: chave } = await supabase.from("chaves_internas").select("valor").eq("nome", "pesquisa-midia").maybeSingle();
  if (!chave?.valor || req.headers.get("x-chave-interna") !== chave.valor) {
    return new Response(JSON.stringify({ erro: "nao-autorizado" }), { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const acao: string = body.acao ?? "tudo";

  // Diagnóstico: o que o HTML de uma página traz (links do mesmo site) e
  // quais sitemaps o robots.txt do site declara.
  if (acao === "inspecionar" && typeof body.url === "string") {
    const res = await baixar(body.url);
    const html = res.ok ? await res.text() : "";
    const base = new URL(res.url || body.url);
    const caminhos = new Set<string>();
    for (const m of html.matchAll(/\bhref\s*=\s*["']([^"'#]+)["']|<loc>\s*([^<\s]+)\s*<\/loc>/gi)) {
      try {
        const u = new URL((m[1] ?? m[2]).trim(), base);
        if (u.host.replace(/^www\./, "") === base.host.replace(/^www\./, "")) caminhos.add(u.pathname);
      } catch { /* ignora */ }
    }
    let sitemaps: string[] = [];
    try {
      const robots = await baixar(`${base.origin}/robots.txt`, 10000);
      if (robots.ok) sitemaps = [...(await robots.text()).matchAll(/^\s*sitemap:\s*(\S+)/gim)].map((m) => m[1]);
    } catch { /* sem robots */ }
    return new Response(
      JSON.stringify({ status: res.status, final: res.url, tamanho: html.length, total: caminhos.size, caminhos: [...caminhos].filter((c) => !body.filtro || new RegExp(body.filtro).test(c)).slice(0, 200), sitemaps }),
      { headers: { "content-type": "application/json" } },
    );
  }
  const dryRun = !!body.dryRun;
  const agora = new Date().toISOString();

  // Links já conhecidos do catálogo (não são novidade).
  const { data: veiculos, error: errV } = await supabase
    .from("veiculos")
    .select("id, montadora_id, nome_comercial, link_oficial_url, verificado_br_url");
  if (errV) return new Response(JSON.stringify({ ok: false, erro: errV.message }), { status: 500 });
  const doCatalogo = new Map<string, any>();
  for (const v of veiculos ?? []) {
    for (const u of [v.link_oficial_url, v.verificado_br_url]) {
      try {
        if (u) doCatalogo.set(normalizarUrl(new URL(u)), v);
      } catch { /* url inválida no cadastro */ }
    }
  }

  const novidades: any[] = [];
  const relatorio: any = { sites: [], paginasForaDoAr: 0, paginasVerificadas: 0 };

  if (acao === "tudo" || acao === "sites") {
    const { data: fontes } = await supabase.from("monitor_fontes").select("*").eq("ativo", true);
    await emLotes(fontes ?? [], 6, async (f: any) => {
      let status: number | null = null;
      let erro: string | null = null;
      let links: Link[] = [];
      try {
        const padrao = f.padrao ? new RegExp(f.padrao) : null;
        if (f.tipo === "sitemap") {
          links = await linksDoSitemap(f.url, padrao);
          status = 200;
        } else {
          const res = await baixar(f.url);
          status = res.status;
          if (res.ok) links = extrairLinks(await res.text(), res.url || f.url, padrao);
          else erro = `HTTP ${res.status}`;
        }
      } catch (e: any) {
        erro = String(e?.name === "AbortError" ? "tempo esgotado" : e?.message ?? e);
      }
      const anterior: Link[] | null = Array.isArray(f.snapshot) ? f.snapshot : null;
      const linhaBase = anterior === null;
      const chaves = (l: Link[]) => new Set(l.map((x) => normalizarUrl(new URL(x.url))));
      let novos = 0;
      let removidos = 0;
      // Só compara quando as duas leituras deram certo (evita alarme falso por bloqueio ou erro).
      if (!erro && links.length && anterior?.length) {
        const antes = chaves(anterior);
        const depois = chaves(links);
        for (const l of links) {
          const k = normalizarUrl(new URL(l.url));
          if (antes.has(k) || doCatalogo.has(k)) continue;
          novos++;
          novidades.push({
            montadora_id: f.montadora_id,
            tipo: "link_novo",
            titulo: l.texto || new URL(l.url).pathname,
            url: l.url,
            fonte_url: f.url,
          });
        }
        for (const l of anterior) {
          const k = normalizarUrl(new URL(l.url));
          const v = doCatalogo.get(k);
          if (depois.has(k) || !v) continue; // só alerta remoção de modelo que está no catálogo
          removidos++;
          novidades.push({
            montadora_id: f.montadora_id,
            veiculo_id: v.id,
            tipo: "link_removido",
            titulo: `${v.nome_comercial}: saiu da página da marca`,
            url: l.url,
            fonte_url: f.url,
          });
        }
      }
      relatorio.sites.push({ url: f.url, status, erro, links: links.length, linhaBase, novos, removidos });
      if (!dryRun) {
        await supabase
          .from("monitor_fontes")
          .update({
            verificado_em: agora,
            status_http: status,
            erro: erro ?? (links.length ? null : "nenhum link de modelo no HTML (página pode carregar por JavaScript)"),
            // Mantém a última leitura boa quando a atual falha.
            ...(links.length ? { snapshot: links } : {}),
          })
          .eq("id", f.id);
      }
    });
  }

  if (acao === "tudo" || acao === "paginas") {
    const comLink = (veiculos ?? []).filter((v: any) => v.link_oficial_url);
    await emLotes(comLink, 8, async (v: any) => {
      try {
        const res = await baixar(v.link_oficial_url, 15000);
        relatorio.paginasVerificadas++;
        // 404/410 = página retirada. 403 e 5xx são bloqueio/instabilidade, não contam.
        if (res.status === 404 || res.status === 410) {
          relatorio.paginasForaDoAr++;
          novidades.push({
            montadora_id: v.montadora_id,
            veiculo_id: v.id,
            tipo: "pagina_fora_do_ar",
            titulo: `${v.nome_comercial}: página oficial respondeu ${res.status}`,
            url: v.link_oficial_url,
            fonte_url: v.link_oficial_url,
          });
        }
        await res.body?.cancel();
      } catch { /* tempo esgotado: tenta de novo na próxima semana */ }
    });
  }

  let gravadas = 0;
  if (!dryRun && novidades.length) {
    const { data, error } = await supabase
      .from("monitor_novidades")
      .upsert(novidades, { onConflict: "tipo,url", ignoreDuplicates: true })
      .select("id");
    if (error) return new Response(JSON.stringify({ ok: false, erro: error.message }), { status: 500 });
    gravadas = data?.length ?? 0;
  }

  return new Response(
    JSON.stringify({ ok: true, dryRun, novidades: novidades.length, gravadas, amostra: novidades.slice(0, 10), ...relatorio }),
    { headers: { "content-type": "application/json" } },
  );
});
