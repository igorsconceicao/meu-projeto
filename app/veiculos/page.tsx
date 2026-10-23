import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { FiltrosCatalogo } from "@/components/catalogo/filtros-catalogo";
import { projecoes, ResumoProjecao, resumoPalhetas } from "@/components/tecnico/conectividade";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { normalizar } from "@/lib/busca";
import { projecaoSemFio, tipoFarol } from "@/lib/classificacao";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import type { Veiculo } from "@/lib/tipos";

export const metadata = {
  title: "Veículos",
};

export const dynamic = "force-dynamic";

type Filtros = {
  q?: string;
  marca?: string;
  categoria?: string;
  propulsao?: string;
  conexao?: string;
  farol?: string;
  palhetas?: string;
};

function filtrar(lista: Veiculo[], f: Filtros): Veiculo[] {
  const termos = normalizar(f.q ?? "").split(" ").filter(Boolean);
  return lista.filter((v) => {
    if (f.marca && v.montadoraSlug !== f.marca) return false;
    if (f.categoria && v.categoria !== f.categoria) return false;
    if (f.propulsao && v.propulsao !== f.propulsao) return false;
    if (f.conexao === "sem-fio" && projecaoSemFio(v) === "nenhuma") return false;
    if (f.conexao === "so-cabo" && projecaoSemFio(v) !== "nenhuma") return false;
    if (f.farol && tipoFarol(v) !== f.farol) return false;
    const temPalheta = !!resumoPalhetas(v.tecnicos?.palhetas).dianteira;
    if (f.palhetas === "com" && !temPalheta) return false;
    if (f.palhetas === "sem" && temPalheta) return false;
    if (termos.length) {
      const t = v.tecnicos;
      const texto = normalizar(
        [v.marca, v.nomeComercial, v.categoria, v.propulsao, t?.multimidia?.sistema, t?.multimidia?.telaPolegadas]
          .filter(Boolean)
          .join(" "),
      );
      if (!termos.every((x) => texto.includes(x))) return false;
    }
    return true;
  });
}

export default async function PaginaVeiculos({
  searchParams,
}: {
  searchParams: Promise<Filtros>;
}) {
  const filtros = await searchParams;
  const todos = await buscarVeiculos();
  const publicados = todos
    .filter((v) => v.completude?.publicavel)
    .sort((a, b) => a.marca.localeCompare(b.marca) || a.nomeComercial.localeCompare(b.nomeComercial));
  const emVerificacao = todos.length - publicados.length;
  const veiculos = filtrar(publicados, filtros);
  const filtrando = veiculos.length !== publicados.length;

  const marcas = Array.from(new Map(publicados.map((v) => [v.montadoraSlug, v.marca])))
    .map(([valor, rotulo]) => ({ valor, rotulo }))
    .sort((a, b) => a.rotulo.localeCompare(b.rotulo));
  const categorias = Array.from(new Set(publicados.map((v) => v.categoria))).sort();

  return (
    <div className="flex flex-col gap-5">
      <CabecalhoPagina
        titulo="Veículos"
        descricao="CarPlay e Android Auto (por cabo e sem fio), tela da central e palhetas de cada modelo vendido no Brasil. Clique num modelo para ver a ficha completa e as fontes."
      />

      <FiltrosCatalogo marcas={marcas} categorias={categorias} />

      <p className="text-sm text-muted-foreground">
        {filtrando ? `${veiculos.length} de ` : ""}
        {publicados.length} modelo{publicados.length === 1 ? "" : "s"}
        {emVerificacao > 0 ? ` · outros ${emVerificacao} aguardando a informação de CarPlay/Android Auto` : ""}
      </p>

      {veiculos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum modelo com esses filtros.
        </div>
      ) : (
        <>
          {/* Computador: tabela */}
          <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Tela</TableHead>
                  <TableHead className="w-36">Apple CarPlay</TableHead>
                  <TableHead className="w-36">Android Auto</TableHead>
                  <TableHead>Palheta dianteira</TableHead>
                  <TableHead>Palheta traseira</TableHead>
                  <TableHead className="w-8" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {veiculos.map((v) => {
                  const p = projecoes(v.tecnicos?.multimidia);
                  const pal = resumoPalhetas(v.tecnicos?.palhetas);
                  return (
                    <TableRow key={v.id} className="group relative cursor-pointer">
                      <TableCell>
                        <Link href={`/veiculos/${v.slug}`} className="flex items-center gap-3 after:absolute after:inset-0">
                          <LogoMontadora nome={v.marca} slug={v.montadoraSlug} logotipoUrl={v.montadora?.logotipoUrl ?? null} tamanho="sm" />
                          <span className="min-w-0">
                            <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">{v.marca}</span>
                            <span className="block font-medium group-hover:text-primary">{v.nomeComercial}</span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[160px] text-sm">
                        <span className="line-clamp-2">{v.tecnicos?.multimidia?.telaPolegadas ?? <Vazio />}</span>
                      </TableCell>
                      <TableCell><ResumoProjecao {...p.carplay} /></TableCell>
                      <TableCell><ResumoProjecao {...p.androidAuto} /></TableCell>
                      <TableCell className="text-sm">{pal.dianteira ?? <Vazio />}</TableCell>
                      <TableCell className="text-sm">{pal.traseira ?? <Vazio />}</TableCell>
                      <TableCell><ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Celular: cartões compactos */}
          <ul className="space-y-3 md:hidden">
            {veiculos.map((v) => {
              const p = projecoes(v.tecnicos?.multimidia);
              const pal = resumoPalhetas(v.tecnicos?.palhetas);
              return (
                <li key={v.id}>
                  <Link href={`/veiculos/${v.slug}`} className="block rounded-lg border bg-card p-4 active:bg-accent">
                    <div className="flex items-center gap-3">
                      <LogoMontadora nome={v.marca} slug={v.montadoraSlug} logotipoUrl={v.montadora?.logotipoUrl ?? null} tamanho="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{v.marca}</p>
                        <p className="font-medium">{v.nomeComercial}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-1 text-xs font-medium">CarPlay</p>
                        <ResumoProjecao {...p.carplay} />
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-medium">Android Auto</p>
                        <ResumoProjecao {...p.androidAuto} />
                      </div>
                    </div>
                    <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Tela</dt>
                        <dd className="line-clamp-2">{v.tecnicos?.multimidia?.telaPolegadas ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Palheta diant.</dt>
                        <dd>{pal.dianteira ?? "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Palheta tras.</dt>
                        <dd>{pal.traseira ?? "—"}</dd>
                      </div>
                    </dl>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function Vazio() {
  return <span className="text-xs text-muted-foreground">sem info</span>;
}
