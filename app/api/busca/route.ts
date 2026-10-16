import { NextResponse } from "next/server";
import { buscarNoCatalogo } from "@/lib/busca";

export const dynamic = "force-dynamic";

/** Sugestões da barra de busca do topo (respostas curtas). */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 80) ?? "";
  const r = await buscarNoCatalogo(q, 6);
  return NextResponse.json({
    montadoras: r.montadoras.map((m) => ({
      slug: m.slug,
      nome: m.nome,
      logotipoUrl: m.logotipoUrl,
      modelos: m.qtdModelos ?? 0,
    })),
    veiculos: r.veiculos.map((v) => ({
      slug: v.slug,
      nome: v.nomeComercial,
      marca: v.marca,
      categoria: v.categoria,
      fotoUrl: v.fotoPrincipalUrl,
    })),
    componentes: r.componentes.map((c) => ({
      slug: c.veiculo.slug,
      veiculo: `${c.veiculo.marca} ${c.veiculo.nomeComercial}`,
      tipo: c.tipo,
      posicao: c.posicao,
      codigo: c.codigo,
    })),
    emVerificacao: r.emVerificacao,
  });
}
