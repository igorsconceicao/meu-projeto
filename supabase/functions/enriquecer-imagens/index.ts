// Edge Function — Enriquecer logotipos e fotos via Wikidata/Commons.
// Rodada no Supabase (Deno), com acesso automático a SUPABASE_URL e
// SUPABASE_SERVICE_ROLE_KEY injetados pelo runtime.
//
// Invocação:
//   POST /functions/v1/enriquecer-imagens
//   Body JSON (opcional): { "modo": "tudo" | "apenas-marcas" | "apenas-veiculos" | "dry-run" }
//
// Response: { ok, modo, montadoras: {atualizadas, puladas, erros},
//             veiculos: {atualizadas, puladas, erros} }

// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const UA =
  "InteligenciaAutomotivaBR/1.0 (https://github.com/igorsconceicao/meu-projeto)";

const QID_POR_SLUG: Record<string, string> = {
  byd: "Q252051",
  chevrolet: "Q27583",
  chery: "Q841497",
  citroen: "Q6746",
  fiat: "Q27835",
  ford: "Q44294",
  gwm: "Q739171",
  honda: "Q9584",
  hyundai: "Q55931",
  jac: "Q866298",
  jeep: "Q214617",
  mitsubishi: "Q35320",
  nissan: "Q11213",
  peugeot: "Q6742",
  ram: "Q749914",
  renault: "Q6686",
  toyota: "Q53268",
  volkswagen: "Q246",
  volvo: "Q215293",
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "User-Agent": UA,
      "Accept": "application/sparql-results+json, application/json",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} em ${url}`);
  return res.json();
}

async function fetchEntity(qid: string) {
  const data = await fetchJson(
    `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`,
  );
  return data.entities?.[qid] ?? null;
}

function extractFileFromClaims(entity: any, propId: string): string | null {
  const claims = entity?.claims?.[propId];
  if (!claims?.length) return null;
  const preferido =
    claims.find((c: any) => c.rank === "preferred") ??
    claims.find((c: any) => c.rank === "normal");
  const value = preferido?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
}

function extractUrlClaim(entity: any, propId: string): string | null {
  const claims = entity?.claims?.[propId];
  if (!claims?.length) return null;
  const preferido =
    claims.find((c: any) => c.rank === "preferred") ??
    claims.find((c: any) => c.rank === "normal");
  const value = preferido?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
}

function commonsImageUrl(fileName: string, width?: number): string {
  const encoded = encodeURIComponent(fileName.replace(/ /g, "_"));
  const w = width ? `?width=${width}` : "";
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}${w}`;
}

async function fetchCommonsCredit(fileName: string): Promise<string> {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=extmetadata|url&iiextmetadatafilter=Artist|LicenseShortName|Credit|LicenseUrl` +
    `&titles=${encodeURIComponent("File:" + fileName)}`;
  try {
    const data = await fetchJson(url);
    const pages = data.query?.pages ?? {};
    const first: any = Object.values(pages)[0];
    const info = first?.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const autor = meta.Artist?.value?.replace(/<[^>]*>/g, "").trim();
    const licenca = meta.LicenseShortName?.value;
    const base =
      [autor, licenca].filter(Boolean).join(" · ") || "Wikimedia Commons";
    return `${base} (via Wikimedia Commons)`;
  } catch (_e) {
    return "Wikimedia Commons";
  }
}

async function resolveVeiculoQId(
  marca: string,
  modelo: string,
): Promise<string | null> {
  for (const label of [`${marca} ${modelo}`, modelo]) {
    const sparql = `
      SELECT ?model WHERE {
        ?model rdfs:label|skos:altLabel "${label.replace(/"/g, "")}"@en.
        ?model wdt:P31/wdt:P279* wd:Q3231690.
      } LIMIT 1
    `;
    try {
      const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
      const data = await fetchJson(url);
      const b = data.results?.bindings?.[0];
      const m = b?.model?.value?.match(/\/(Q\d+)$/);
      if (m) {
        await wait(1100);
        return m[1];
      }
    } catch {
      // segue para fallback
    }
    await wait(1100);
  }

  try {
    const url =
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=1&search=${encodeURIComponent(`${marca} ${modelo}`)}`;
    const data = await fetchJson(url);
    const first = data.search?.[0];
    if (first?.id) return first.id;
  } catch {
    // ignora
  }
  return null;
}

Deno.serve(async (req) => {
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !KEY) {
    return new Response(
      JSON.stringify({ ok: false, erro: "Variáveis de ambiente ausentes" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  let modo = "tudo";
  try {
    const body = await req.json();
    if (body?.modo) modo = String(body.modo);
  } catch {
    // sem body é OK
  }
  const url = new URL(req.url);
  const modoParam = url.searchParams.get("modo");
  if (modoParam) modo = modoParam;

  const dryRun = modo === "dry-run";
  const soMarcas = modo === "apenas-marcas";
  const soVeiculos = modo === "apenas-veiculos";

  const supabase = createClient(SUPABASE_URL, KEY, {
    auth: { persistSession: false },
  });

  const resultado = {
    ok: true,
    modo,
    montadoras: { atualizadas: 0, puladas: 0, erros: [] as string[] },
    veiculos: { atualizadas: 0, puladas: 0, erros: [] as string[] },
  };

  // ---- MONTADORAS ----
  if (!soVeiculos) {
    const { data: montadoras, error } = await supabase
      .from("montadoras")
      .select("id, slug, nome, logotipo_url, site_oficial_url")
      .order("nome");
    if (error) throw error;

    for (const m of montadoras ?? []) {
      try {
        const qid = QID_POR_SLUG[m.slug];
        if (!qid) {
          resultado.montadoras.puladas++;
          continue;
        }
        const entity = await fetchEntity(qid);
        if (!entity) {
          resultado.montadoras.puladas++;
          continue;
        }
        const logoFile = extractFileFromClaims(entity, "P154");
        const site = extractUrlClaim(entity, "P856");

        const updates: Record<string, unknown> = {};
        if (logoFile) {
          updates.logotipo_url = commonsImageUrl(logoFile, 256);
          updates.logotipo_credito = await fetchCommonsCredit(logoFile);
          await wait(400);
        }
        if (site && !m.site_oficial_url) {
          updates.site_oficial_url = site;
        }
        if (Object.keys(updates).length === 0) {
          resultado.montadoras.puladas++;
          continue;
        }
        if (!dryRun) {
          const { error: errUpd } = await supabase
            .from("montadoras")
            .update(updates)
            .eq("id", m.id);
          if (errUpd) throw errUpd;
        }
        resultado.montadoras.atualizadas++;
      } catch (e: any) {
        resultado.montadoras.erros.push(`${m.nome}: ${e.message ?? e}`);
      }
      await wait(400);
    }
  }

  // ---- VEICULOS ----
  if (!soMarcas) {
    const { data: veiculos, error } = await supabase
      .from("veiculos")
      .select(`
        id, slug, nome_comercial, geracao,
        foto_principal_url, link_oficial_url,
        montadora:montadoras!veiculos_montadora_id_fkey(nome, slug)
      `)
      .order("nome_comercial");
    if (error) throw error;

    for (const v of (veiculos ?? []) as any[]) {
      try {
        const marca = v.montadora?.nome;
        if (!marca) {
          resultado.veiculos.puladas++;
          continue;
        }
        const qid = await resolveVeiculoQId(marca, v.nome_comercial);
        if (!qid) {
          resultado.veiculos.puladas++;
          continue;
        }
        const entity = await fetchEntity(qid);
        await wait(400);
        if (!entity) {
          resultado.veiculos.puladas++;
          continue;
        }
        const fotoFile = extractFileFromClaims(entity, "P18");
        const site = extractUrlClaim(entity, "P856");

        const updates: Record<string, unknown> = {};
        if (fotoFile && !v.foto_principal_url) {
          updates.foto_principal_url = commonsImageUrl(fotoFile, 1280);
          updates.foto_principal_credito = await fetchCommonsCredit(fotoFile);
          await wait(400);
        }
        if (site && !v.link_oficial_url) {
          updates.link_oficial_url = site;
        }
        if (Object.keys(updates).length === 0) {
          resultado.veiculos.puladas++;
          continue;
        }
        if (!dryRun) {
          const { error: errUpd } = await supabase
            .from("veiculos")
            .update(updates)
            .eq("id", v.id);
          if (errUpd) throw errUpd;
        }
        resultado.veiculos.atualizadas++;
      } catch (e: any) {
        resultado.veiculos.erros.push(`${v.nome_comercial}: ${e.message ?? e}`);
      }
    }
  }

  return new Response(JSON.stringify(resultado), {
    headers: { "content-type": "application/json" },
  });
});
