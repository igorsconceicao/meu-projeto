import { NextResponse } from "next/server";
import { buscarVeiculoPorSlug } from "@/lib/dados/veiculos";
import { resumoPalhetas } from "@/lib/palhetas";
import type { EstadoConectividade } from "@/lib/tipos";

export const dynamic = "force-dynamic";

/** Resumo curto de um veículo para a janelinha que abre ao passar o mouse sobre o nome dele. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.slice(0, 120) ?? "";
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ erro: "slug-invalido" }, { status: 400 });
  const r = await buscarVeiculoPorSlug(slug);
  if (!r) return NextResponse.json({ erro: "nao-encontrado" }, { status: 404 });
  const { veiculo: v, tecnicos: t } = r;
  const mm = t.multimidia;
  const estado = (e: EstadoConectividade | undefined) => e ?? "nao_identificado";
  const pal = resumoPalhetas(t.palhetas);
  return NextResponse.json(
    {
      slug: v.slug,
      nome: v.nomeComercial,
      marca: v.marca,
      categoria: v.categoria,
      propulsao: v.propulsao,
      fotoUrl: v.fotoPrincipalUrl,
      versoes: t.versoes.map((x) => x.nome),
      tela: mm?.telaPolegadas ?? null,
      carplay: { geral: estado(mm?.carplay), cabo: estado(mm?.carplayCabo), semFio: estado(mm?.carplaySemFio) },
      androidAuto: { geral: estado(mm?.androidAuto), cabo: estado(mm?.androidAutoCabo), semFio: estado(mm?.androidAutoSemFio) },
      palhetas: { dianteira: pal.dianteira, traseira: pal.traseira },
      motor: t.ficha?.motor ?? null,
    },
    { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" } },
  );
}
