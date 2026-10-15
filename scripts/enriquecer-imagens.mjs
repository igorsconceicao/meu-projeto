#!/usr/bin/env node
/**
 * Enriquecimento automático de logotipos e fotos de veículos
 * via Wikidata + Wikimedia Commons.
 *
 * Fontes:
 *   - Wikidata (SPARQL + EntityData JSON) — resolve marcas e modelos
 *   - Wikimedia Commons API — resolve URL direta da imagem + crédito/licença
 *
 * Variáveis de ambiente obrigatórias:
 *   SUPABASE_URL                — URL do projeto Supabase
 *   SUPABASE_SERVICE_ROLE_KEY   — service_role key (NUNCA no frontend)
 *
 * Opcional:
 *   DRY_RUN=1                   — não grava no banco, só imprime o que faria
 *   APENAS_MARCAS=1             — pula enriquecimento de veículos
 *   APENAS_VEICULOS=1           — pula enriquecimento de montadoras
 *
 * Uso típico (rodado via GitHub Actions):
 *   node scripts/enriquecer-imagens.mjs
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === "1";
const APENAS_MARCAS = process.env.APENAS_MARCAS === "1";
const APENAS_VEICULOS = process.env.APENAS_VEICULOS === "1";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Variáveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const UA =
  "InteligenciaAutomotivaBR/1.0 (https://github.com/igorsconceicao/meu-projeto; contato: via GitHub)";

// Q-IDs confirmados das principais marcas do catálogo. O script tenta estes
// primeiro; se o slug não estiver aqui, usa busca por rótulo no Wikidata.
const QID_POR_SLUG = {
  byd: "Q252051",         // BYD Auto
  chevrolet: "Q27583",    // Chevrolet
  chery: "Q841497",       // Chery
  citroen: "Q6746",       // Citroën
  fiat: "Q27835",         // Fiat Automobiles
  ford: "Q44294",         // Ford Motor Company
  gwm: "Q739171",         // Great Wall Motors
  honda: "Q210464",       // Honda (como marca)
  hyundai: "Q55931",      // Hyundai Motor Company
  jac: "Q866298",         // JAC Motors
  jeep: "Q214617",        // Jeep
  mitsubishi: "Q35320",   // Mitsubishi Motors
  nissan: "Q11213",       // Nissan
  peugeot: "Q6742",       // Peugeot
  ram: "Q749914",         // Ram Trucks
  renault: "Q6686",       // Renault
  toyota: "Q53268",       // Toyota
  volkswagen: "Q246",     // Volkswagen
  volvo: "Q215293",       // Volvo Cars
};

async function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      "User-Agent": UA,
      Accept: "application/sparql-results+json, application/json",
      ...(opts.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} em ${url}`);
  }
  return res.json();
}

/** Baixa a entidade Wikidata completa (JSON linked-data). */
async function fetchEntity(qid) {
  const url = `https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`;
  const data = await fetchJson(url);
  return data.entities?.[qid] ?? null;
}

/** Extrai o nome do arquivo (ex.: "Chevrolet logo.svg") de um claim de imagem. */
function extractFileFromClaims(entity, propId) {
  const claims = entity?.claims?.[propId];
  if (!claims?.length) return null;
  // Prefere claim com rank "preferred", senão "normal"
  const preferido =
    claims.find((c) => c.rank === "preferred") ?? claims.find((c) => c.rank === "normal");
  const value = preferido?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
}

/** Extrai site oficial (P856). Retorna primeiro valor. */
function extractUrlClaim(entity, propId) {
  const claims = entity?.claims?.[propId];
  if (!claims?.length) return null;
  const preferido =
    claims.find((c) => c.rank === "preferred") ?? claims.find((c) => c.rank === "normal");
  const value = preferido?.mainsnak?.datavalue?.value;
  return typeof value === "string" ? value : null;
}

/** URL direta para a imagem no Commons via Special:FilePath. */
function commonsImageUrl(fileName, width) {
  const encoded = encodeURIComponent(fileName.replace(/ /g, "_"));
  const w = width ? `?width=${width}` : "";
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encoded}${w}`;
}

/** Busca metadados (crédito e licença) via API do Commons. */
async function fetchCommonsCredit(fileName) {
  const url =
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo` +
    `&iiprop=extmetadata|url&iiextmetadatafilter=Artist|LicenseShortName|Credit|LicenseUrl` +
    `&titles=${encodeURIComponent("File:" + fileName)}`;
  try {
    const data = await fetchJson(url);
    const pages = data.query?.pages ?? {};
    const first = Object.values(pages)[0];
    const info = first?.imageinfo?.[0];
    const meta = info?.extmetadata ?? {};
    const autor = meta.Artist?.value?.replace(/<[^>]*>/g, "").trim();
    const licenca = meta.LicenseShortName?.value;
    const credito =
      [autor, licenca].filter(Boolean).join(" · ") || "Wikimedia Commons";
    return `${credito} (via Wikimedia Commons)`;
  } catch (e) {
    console.warn(`  ! não achou crédito para ${fileName}: ${e.message}`);
    return "Wikimedia Commons";
  }
}

/** Enriquecer uma montadora com logo (P154) e site oficial (P856). */
async function enrichMontadora(montadora) {
  const qid = QID_POR_SLUG[montadora.slug];
  if (!qid) {
    console.log(`  - sem Q-ID conhecido para ${montadora.slug}, pulando`);
    return;
  }

  const entity = await fetchEntity(qid);
  if (!entity) {
    console.log(`  - entidade ${qid} não resolveu`);
    return;
  }

  const logoFile = extractFileFromClaims(entity, "P154");
  const site = extractUrlClaim(entity, "P856");

  const updates = {};
  if (logoFile) {
    updates.logotipo_url = commonsImageUrl(logoFile, 256);
    updates.logotipo_credito = await fetchCommonsCredit(logoFile);
    await wait(400);
  }
  // Só preenche site oficial se estiver vazio hoje (não sobrescreve o que o
  // usuário/admin já cadastrou manualmente).
  if (site && !montadora.site_oficial_url) {
    updates.site_oficial_url = site;
  }

  if (Object.keys(updates).length === 0) {
    console.log(`  - nada a atualizar para ${montadora.nome}`);
    return;
  }

  console.log(`  ✓ ${montadora.nome}: ${Object.keys(updates).join(", ")}`);
  if (DRY_RUN) return;

  const { error } = await supabase
    .from("montadoras")
    .update(updates)
    .eq("id", montadora.id);
  if (error) console.error(`  ! erro ao salvar ${montadora.nome}: ${error.message}`);
}

/** SPARQL: busca Q-ID do modelo pelo nome + filtro de instância = automobile model. */
async function resolveVeiculoQId(marca, modelo, geracao) {
  // Tenta primeiro "Marca Modelo" exato
  const label1 = `${marca} ${modelo}`;
  // Tenta também modelo sozinho se o primeiro falhar
  const label2 = modelo;

  for (const label of [label1, label2]) {
    const sparql = `
      SELECT ?model ?modelLabel WHERE {
        ?model rdfs:label|skos:altLabel "${label.replace(/"/g, "")}"@en.
        ?model wdt:P31/wdt:P279* wd:Q3231690.
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en,pt". }
      } LIMIT 1
    `;
    try {
      const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(sparql)}`;
      const data = await fetchJson(url);
      const b = data.results?.bindings?.[0];
      if (b?.model?.value) {
        const match = b.model.value.match(/\/(Q\d+)$/);
        if (match) {
          await wait(1100); // respeita rate limit do WDQS
          return match[1];
        }
      }
    } catch (e) {
      console.warn(`    ! SPARQL falhou para "${label}": ${e.message}`);
    }
    await wait(1100);
  }

  // Fallback: wbsearchentities (menos preciso)
  try {
    const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=en&type=item&limit=5&search=${encodeURIComponent(label1)}`;
    const data = await fetchJson(url);
    const first = data.search?.[0];
    if (first?.id) return first.id;
  } catch (e) {
    // ignora
  }
  return null;
}

/** Enriquecer um veículo com foto principal (P18) e link oficial (P856). */
async function enrichVeiculo(veiculo) {
  const marca = veiculo.montadora?.nome;
  if (!marca) {
    console.log(`  - veículo ${veiculo.slug} sem marca, pulando`);
    return;
  }

  const qid = await resolveVeiculoQId(marca, veiculo.nome_comercial, veiculo.geracao);
  if (!qid) {
    console.log(`  - sem Q-ID para ${marca} ${veiculo.nome_comercial}`);
    return;
  }

  const entity = await fetchEntity(qid);
  await wait(400);
  if (!entity) {
    console.log(`  - entidade ${qid} não resolveu`);
    return;
  }

  const fotoFile = extractFileFromClaims(entity, "P18");
  const site = extractUrlClaim(entity, "P856");

  const updates = {};
  if (fotoFile && !veiculo.foto_principal_url) {
    updates.foto_principal_url = commonsImageUrl(fotoFile, 1280);
    updates.foto_principal_credito = await fetchCommonsCredit(fotoFile);
    await wait(400);
  }
  if (site && !veiculo.link_oficial_url) {
    updates.link_oficial_url = site;
  }

  if (Object.keys(updates).length === 0) {
    console.log(`  - nada a atualizar para ${marca} ${veiculo.nome_comercial}`);
    return;
  }

  console.log(`  ✓ ${marca} ${veiculo.nome_comercial} (${qid}): ${Object.keys(updates).join(", ")}`);
  if (DRY_RUN) return;

  const { error } = await supabase
    .from("veiculos")
    .update(updates)
    .eq("id", veiculo.id);
  if (error) console.error(`  ! erro ao salvar ${marca} ${veiculo.nome_comercial}: ${error.message}`);
}

async function main() {
  console.log(`\n=== Enriquecimento de imagens (DRY_RUN=${DRY_RUN}) ===\n`);

  if (!APENAS_VEICULOS) {
    console.log("## Montadoras");
    const { data: montadoras, error } = await supabase
      .from("montadoras")
      .select("id, slug, nome, logotipo_url, site_oficial_url")
      .order("nome");
    if (error) throw error;
    for (const m of montadoras ?? []) {
      try {
        await enrichMontadora(m);
      } catch (e) {
        console.error(`  ! erro em ${m.nome}: ${e.message}`);
      }
      await wait(400);
    }
  }

  if (!APENAS_MARCAS) {
    console.log("\n## Veículos");
    const { data: veiculos, error } = await supabase
      .from("veiculos")
      .select(`
        id, slug, nome_comercial, geracao,
        foto_principal_url, link_oficial_url,
        montadora:montadoras!veiculos_montadora_id_fkey(nome, slug)
      `)
      .order("nome_comercial");
    if (error) throw error;
    for (const v of veiculos ?? []) {
      try {
        await enrichVeiculo(v);
      } catch (e) {
        console.error(`  ! erro em ${v.nome_comercial}: ${e.message}`);
      }
    }
  }

  console.log("\n=== Concluído ===");
}

main().catch((e) => {
  console.error("Erro fatal:", e);
  process.exit(1);
});
