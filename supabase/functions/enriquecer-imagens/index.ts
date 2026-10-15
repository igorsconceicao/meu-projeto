// Desativada: o enriquecimento automático via Wikidata trazia fotos de versões
// estrangeiras/antigas e links de sites de outros países. A mídia agora é
// curada a partir dos sites oficiais brasileiros (ver supabase/curadoria/)
// usando a função somente-leitura pesquisar-midia.
Deno.serve(() =>
  new Response(
    JSON.stringify({ ok: false, erro: "desativada" }),
    { status: 410, headers: { "content-type": "application/json" } },
  )
);
