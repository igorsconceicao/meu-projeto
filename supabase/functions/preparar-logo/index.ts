// Prepara uma versão leve de um logotipo oficial publicado pela própria marca.
// Alguns sites oficiais entregam o logo como SVG com uma imagem gigante dentro
// (ex.: Denza, 250 KB a 3,6 MB). Esta função baixa o arquivo do endereço
// oficial informado, recorta as margens transparentes e reduz para o tamanho
// usado no site — sem alterar cores ou desenho.
//
// POST { url: "https://site-oficial/.../logo.svg", lado?: 128, salvarComo?: "denza.png" }
//   → { origem, original, recorte, final, corMedia, fracaoBranca, previa, urlPublica? }
//   `previa` desenha o logo em caracteres (para conferir o formato sem abrir imagem).
//   `salvarComo` grava o PNG no armazenamento público "marcas" do Supabase.
//
// Requer o header x-chave-interna (valor em public.chaves_internas).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decode, Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const UA = "Mozilla/5.0 (compatible; InteligenciaAutomotivaBR/1.0)";

function deBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

Deno.serve(async (req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const { data: chave } = await supabase.from("chaves_internas").select("valor").eq("nome", "pesquisa-midia").maybeSingle();
  if (!chave?.valor || req.headers.get("x-chave-interna") !== chave.valor) {
    return Response.json({ erro: "nao-autorizado" }, { status: 401 });
  }

  try {
    const corpo = await req.json().catch(() => ({}));
    const url = String(corpo.url ?? "");
    const lado = Math.min(512, Math.max(32, Number(corpo.lado) || 128));
    if (!url.startsWith("https://")) return Response.json({ erro: "url-invalida" }, { status: 400 });

    const resp = await fetch(url, { headers: { "User-Agent": UA } });
    if (!resp.ok) return Response.json({ erro: `origem respondeu ${resp.status}` }, { status: 502 });
    const tipo = resp.headers.get("content-type") ?? "";

    // SVG com imagem embutida: usa a maior imagem de dentro dele.
    let bytes: Uint8Array;
    if (tipo.includes("svg") || url.toLowerCase().split("?")[0].endsWith(".svg")) {
      const texto = await resp.text();
      const embutidas = [...texto.matchAll(/data:image\/(?:png|jpeg);base64,([A-Za-z0-9+/=\s]+)/g)].map((m) =>
        m[1].replace(/\s+/g, ""),
      );
      if (!embutidas.length) return Response.json({ erro: "svg-sem-imagem-embutida (já é vetorial e leve)" }, { status: 422 });
      bytes = deBase64(embutidas.sort((a, b) => b.length - a.length)[0]);
    } else {
      bytes = new Uint8Array(await resp.arrayBuffer());
    }

    const img = (await decode(bytes)) as Image;
    const { width: w, height: h, bitmap } = img;

    // Recorte das margens transparentes.
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (bitmap[(y * w + x) * 4 + 3] > 16) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    const recortada = x1 >= x0 ? img.clone().crop(x0, y0, x1 - x0 + 1, y1 - y0 + 1) : img.clone();
    const cw = recortada.width, ch = recortada.height;
    if (cw >= ch) recortada.resize(Math.min(lado, cw), Image.RESIZE_AUTO);
    else recortada.resize(Image.RESIZE_AUTO, Math.min(lado, ch));

    // Cor média dos pixels visíveis (para saber se o logo é claro ou escuro).
    let r = 0, g = 0, b = 0, peso = 0, brancos = 0, visiveis = 0;
    const bm = recortada.bitmap;
    for (let i = 0; i < bm.length; i += 4) {
      const a = bm[i + 3] / 255;
      if (a < 0.1) continue;
      visiveis++;
      r += bm[i] * a; g += bm[i + 1] * a; b += bm[i + 2] * a; peso += a;
      if (bm[i] > 230 && bm[i + 1] > 230 && bm[i + 2] > 230) brancos++;
    }
    const hex = (n: number) => Math.round(n / (peso || 1)).toString(16).padStart(2, "0");
    const png = await recortada.encode();

    // Prévia em texto: cada caractere = um bloco da imagem (escuro = "#", médio = "+", claro = ".").
    const colunas = 40;
    const linhas = Math.max(4, Math.round((colunas * recortada.height) / recortada.width / 2));
    const previa: string[] = [];
    for (let ly = 0; ly < linhas; ly++) {
      let linha = "";
      for (let cx = 0; cx < colunas; cx++) {
        const px = Math.min(recortada.width - 1, Math.floor(((cx + 0.5) * recortada.width) / colunas));
        const py = Math.min(recortada.height - 1, Math.floor(((ly + 0.5) * recortada.height) / linhas));
        const i = (py * recortada.width + px) * 4;
        const a = bm[i + 3] / 255;
        const lum = (0.299 * bm[i] + 0.587 * bm[i + 1] + 0.114 * bm[i + 2]) / 255;
        linha += a < 0.2 ? " " : lum < 0.45 ? "#" : lum < 0.75 ? "+" : ".";
      }
      previa.push(linha.replace(/\s+$/, ""));
    }

    let urlPublica: string | undefined;
    const salvarComo = typeof corpo.salvarComo === "string" ? corpo.salvarComo : "";
    if (salvarComo) {
      if (!/^[a-z0-9-]+\.png$/.test(salvarComo)) return Response.json({ erro: "nome-invalido" }, { status: 400 });
      const { error } = await supabase.storage.from("marcas").upload(salvarComo, png, {
        contentType: "image/png",
        upsert: true,
        cacheControl: "2592000",
      });
      if (error) return Response.json({ erro: `falha ao salvar: ${error.message}` }, { status: 500 });
      urlPublica = supabase.storage.from("marcas").getPublicUrl(salvarComo).data.publicUrl;
    }

    return Response.json({
      origem: url,
      original: { largura: w, altura: h, bytesArquivo: bytes.length },
      recorte: { x: x0, y: y0, largura: cw, altura: ch },
      final: { largura: recortada.width, altura: recortada.height, bytes: png.length },
      corMedia: `#${hex(r)}${hex(g)}${hex(b)}`,
      fracaoBranca: visiveis ? +(brancos / visiveis).toFixed(3) : null,
      previa,
      urlPublica,
    });
  } catch (e) {
    return Response.json({ erro: String(e) }, { status: 500 });
  }
});
