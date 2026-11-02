import { NextResponse } from "next/server";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { resumoPalhetas } from "@/lib/palhetas";
import type { EstadoConectividade } from "@/lib/tipos";

export const dynamic = "force-dynamic";

/** Resumo curto de um veículo para a janelinha que abre ao passar o mouse sobre o nome dele. */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug")?.slice(0, 120) ?? "";
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ erro: "slug-invalido" }, { status: 400 });
  // Vem do catálogo em cache: responde em milissegundos, sem ir ao banco.
  const v = (await buscarVeiculos()).find((x) => x.slug === slug);
  if (!v?.tecnicos) return NextResponse.json({ erro: "nao-encontrado" }, { status: 404 });
  const t = v.tecnicos;
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
    // Só o navegador de quem está logado guarda; nenhuma CDN/proxy no meio.
    { headers: { "Cache-Control": "private, max-age=300" } },
  );
}
