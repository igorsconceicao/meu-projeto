// Importa o ranking oficial de emplacamentos do Informativo mensal da
// Fenabrave (PDF público) para a tabela public.emplacamentos. Não usa IA:
// lê o texto do PDF e extrai as listas "Ranking dos emplacamentos em <mês>"
// e "... acumulados até <mês>" (Automóveis e Comerciais leves).
//
// POST {}                       → descobre e importa o informativo mais recente
// POST { url: "https://..." }   → importa um PDF específico
// POST { dryRun: true }         → só devolve o que seria gravado
//
// Requer o header x-chave-interna (valor em public.chaves_internas).

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UA = "InteligenciaAutomotivaBR/1.0 (+https://github.com/igorsconceicao/meu-projeto)";
const LISTAGEM = "https://www.fenabrave.org.br/portal/conteudo/emplacamentos";

const MESES: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

type Linha = {
  periodo: string;
  tipo: "mensal" | "acumulado";
  segmento: "Automóveis" | "Comerciais leves";
  posicao: number;
  marca: string;
  modelo: string;
  unidades: number;
  fonte_url: string;
  edicao: string | null;
  consultado_em: string;
};

function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function baixar(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 30000);
  try {
    return await fetch(url, { headers: { "User-Agent": UA }, signal: ctrl.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
}

/** URL do informativo mais recente listado no portal (arquivos AAAA_MM_02.pdf). */
async function informativoMaisRecente(): Promise<string> {
  const html = await (await baixar(LISTAGEM)).text();
  const links = [...html.matchAll(/files\/(\d{4})_(\d{2})_02\.pdf/g)].map((m) => `${m[1]}_${m[2]}`);
  if (!links.length) throw new Error("nenhum informativo encontrado na listagem");
  links.sort().reverse();
  return `https://www.fenabrave.org.br/portal/files/${links[0]}_02.pdf`;
}

async function textoDoPdf(url: string): Promise<string> {
  const res = await baixar(url);
  if (!res.ok) throw new Error(`PDF respondeu ${res.status}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const { extractText, getDocumentProxy } = await import("npm:unpdf@1.4.0");
  const doc = await getDocumentProxy(bytes);
  const { text } = await extractText(doc, { mergePages: true });
  return (Array.isArray(text) ? text.join(" ") : text).replace(/\s+/g, " ");
}

// "12º CAOA CHERY/TIGGO 7 4.102" → posição, marca, modelo, unidades.
// O número de unidades é o último antes do próximo "Nº", de "COMERCIAIS" ou do fim do bloco.
const ITEM = /(\d{1,2})º\s+([A-Z0-9][A-Z0-9 .&'\-]*?)\/(.+?)\s+(\d{1,3}(?:\.\d{3})*)(?=\s+\d{1,2}º|\s+COMERCIAIS|\s*$)/g;

function itens(bloco: string) {
  const out: { posicao: number; marca: string; modelo: string; unidades: number }[] = [];
  for (const m of bloco.matchAll(ITEM)) {
    out.push({
      posicao: Number(m[1]),
      marca: m[2].trim(),
      modelo: m[3].trim(),
      unidades: Number(m[4].replace(/\./g, "")),
    });
  }
  return out;
}

function extrair(texto: string, fonte: string): Linha[] {
  const edicao = texto.match(/Ed\.\s*(\d+)/)?.[1] ?? null;
  const hoje = new Date().toISOString().slice(0, 10);
  const linhas: Linha[] = [];
  const re = /Ranking dos emplacamentos (em|acumulados até) ([A-Za-zçÇ]+)\/(\d{4})/g;
  for (const m of texto.matchAll(re)) {
    const mes = MESES[semAcento(m[2])];
    if (!mes) continue;
    const periodo = `${m[3]}-${String(mes).padStart(2, "0")}-01`;
    const tipo = m[1] === "em" ? "mensal" : "acumulado";
    // O bloco vai do título até o cabeçalho da próxima página ("Ed. NNN Informativo")
    const inicio = (m.index ?? 0) + m[0].length;
    const fim = texto.indexOf(" Ed. ", inicio);
    const bloco = texto.slice(inicio, fim === -1 ? undefined : fim);
    const iAuto = bloco.indexOf("AUTOMÓVEIS");
    const iCom = bloco.indexOf("COMERCIAIS LEVES");
    if (iAuto === -1) continue;
    const partes: [Linha["segmento"], string][] = [
      ["Automóveis", bloco.slice(iAuto + "AUTOMÓVEIS".length, iCom === -1 ? undefined : iCom)],
    ];
    if (iCom !== -1) partes.push(["Comerciais leves", bloco.slice(iCom + "COMERCIAIS LEVES".length)]);
    for (const [segmento, trecho] of partes) {
      for (const it of itens(trecho)) {
        linhas.push({ periodo, tipo, segmento, ...it, fonte_url: fonte, edicao, consultado_em: hoje });
      }
    }
  }
  // Mantém só a primeira ocorrência de cada (periodo, tipo, segmento, posicao)
  const vistos = new Set<string>();
  return linhas.filter((l) => {
    const k = `${l.periodo}|${l.tipo}|${l.segmento}|${l.posicao}`;
    if (vistos.has(k)) return false;
    vistos.add(k);
    return true;
  });
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
  try {
    const url = typeof body.url === "string" && body.url.startsWith("https://www.fenabrave.org.br/")
      ? body.url
      : await informativoMaisRecente();
    const linhas = extrair(await textoDoPdf(url), url);
    const resumo = {
      url,
      total: linhas.length,
      periodos: [...new Set(linhas.map((l) => `${l.periodo} ${l.tipo} ${l.segmento}`))],
      amostra: linhas.slice(0, 5),
    };
    if (!body.dryRun && linhas.length) {
      const { error } = await supabase
        .from("emplacamentos")
        .upsert(linhas, { onConflict: "periodo,tipo,segmento,posicao" });
      if (error) throw error;
    }
    return new Response(JSON.stringify({ ok: true, gravado: !body.dryRun, ...resumo }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, erro: String(e?.message ?? e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
});
