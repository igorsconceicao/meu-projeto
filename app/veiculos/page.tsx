import Link from "next/link";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { FiltrosCatalogo } from "@/components/catalogo/filtros-catalogo";
import { projecoes, ResumoProjecao, resumoPalhetas } from "@/components/tecnico/conectividade";
import { normalizar } from "@/lib/busca";
import { conexaoCabo, projecaoSemFio, tipoFarol } from "@/lib/classificacao";
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
  agrupar?: string;
};

type Grupo = { chave: string; titulo: string; ancora: string; exemplo: Veiculo; itens: Veiculo[] };

const comparar = (a: string, b: string) => a.localeCompare(b, "pt-BR", { sensitivity: "base" });

/** Separa a lista por marca (padrão) ou por categoria, com grupos e modelos em ordem alfabética. */
function agrupar(lista: Veiculo[], por: "marca" | "categoria"): Grupo[] {
  const grupos = new Map<string, Grupo>();
  for (const v of lista) {
    const chave = por === "marca" ? v.montadoraSlug : v.categoria;
    const titulo = por === "marca" ? v.marca : v.categoria;
    const ancora = `grupo-${normalizar(chave).replace(/[^a-z0-9]+/g, "-")}`;
    const g = grupos.get(chave) ?? { chave, titulo, ancora, exemplo: v, itens: [] };
    g.itens.push(v);
    grupos.set(chave, g);
  }
  return [...grupos.values()]
    .sort((a, b) => comparar(a.titulo, b.titulo))
    .map((g) => ({
      ...g,
      itens: g.itens.sort((a, b) => comparar(a.marca, b.marca) || comparar(a.nomeComercial, b.nomeComercial)),
    }));
}

function filtrar(lista: Veiculo[], f: Filtros): Veiculo[] {
  const termos = normalizar(f.q ?? "").split(" ").filter(Boolean);
  return lista.filter((v) => {
    if (f.marca && v.montadoraSlug !== f.marca) return false;
    if (f.categoria && v.categoria !== f.categoria) return false;
    if (f.propulsao && v.propulsao !== f.propulsao) return false;
    if (f.conexao === "sem-fio" && projecaoSemFio(v) === "nenhuma") return false;
    if (f.conexao === "so-cabo" && projecaoSemFio(v) !== "nenhuma") return false;
    if (f.conexao === "cabo" && conexaoCabo(v) !== "cabo") return false;
    if (f.conexao === "so-sem-fio" && conexaoCabo(v) !== "so-sem-fio") return false;
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
    .sort((a, b) => comparar(a.marca, b.marca) || comparar(a.nomeComercial, b.nomeComercial));
  const emVerificacao = todos.length - publicados.length;
  const veiculos = filtrar(publicados, filtros);
  const filtrando = veiculos.length !== publicados.length;
  const porCategoria = filtros.agrupar === "categoria";
  const grupos = agrupar(veiculos, porCategoria ? "categoria" : "marca");

  const marcas = Array.from(new Map(publicados.map((v) => [v.montadoraSlug, v.marca])))
    .map(([valor, rotulo]) => ({ valor, rotulo }))
    .sort((a, b) => comparar(a.rotulo, b.rotulo));
  const categorias = Array.from(new Set(publicados.map((v) => v.categoria))).sort(comparar);

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
          <nav aria-label={porCategoria ? "Categorias" : "Marcas"} className="flex flex-wrap gap-1.5">
            {grupos.map((g) => (
              <a
                key={g.chave}
                href={`#${g.ancora}`}
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium hover:border-primary/40 hover:text-primary"
              >
                {g.titulo}
                <span className="text-muted-foreground">{g.itens.length}</span>
              </a>
            ))}
          </nav>

          <div className="flex flex-col gap-4">
            {grupos.map((g) => (
              <section key={g.chave} id={g.ancora} className="scroll-mt-20 overflow-hidden rounded-lg border bg-card">
                <div className="grid gap-3 border-b bg-muted/40 px-4 py-2 md:grid-cols-[2fr_1fr_1.3fr_1.3fr_1fr_1fr] md:items-center">
                  <span className="flex min-w-0 items-center gap-2">
                    {porCategoria ? null : (
                      <LogoMontadora
                        nome={g.titulo}
                        slug={g.exemplo.montadoraSlug}
                        logotipoUrl={g.exemplo.montadora?.logotipoUrl ?? null}
                        tamanho="sm"
                      />
                    )}
                    <span className="font-semibold">{g.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      {g.itens.length} modelo{g.itens.length === 1 ? "" : "s"}
                    </span>
                    {porCategoria ? null : (
                      <Link href={`/montadoras/${g.chave}`} className="ml-auto text-xs text-primary hover:underline md:ml-2">
                        ver marca
                      </Link>
                    )}
                  </span>
                  {["Tela", "Apple CarPlay", "Android Auto", "Palheta dianteira", "Palheta traseira"].map((c) => (
                    <span key={c} className="hidden text-xs font-medium text-muted-foreground md:block">
                      {c}
                    </span>
                  ))}
                </div>
                <ul className="divide-y">
                  {g.itens.map((v) => {
                    const p = projecoes(v.tecnicos?.multimidia);
                    const pal = resumoPalhetas(v.tecnicos?.palhetas);
                    return (
                      <li key={v.id}>
                        <Link
                          href={`/veiculos/${v.slug}`}
                          className="grid grid-cols-2 gap-x-3 gap-y-3 px-4 py-3 hover:bg-accent md:grid-cols-[2fr_1fr_1.3fr_1.3fr_1fr_1fr] md:items-center"
                        >
                          <span className="col-span-2 flex items-center gap-3 md:col-span-1">
                            {porCategoria ? (
                              <LogoMontadora nome={v.marca} slug={v.montadoraSlug} logotipoUrl={v.montadora?.logotipoUrl ?? null} tamanho="sm" />
                            ) : null}
                            <span className="min-w-0">
                              <span className="block text-[11px] uppercase tracking-wider text-muted-foreground">
                                {porCategoria ? v.marca : v.categoria}
                              </span>
                              <span className="block font-medium">{v.nomeComercial}</span>
                            </span>
                          </span>
                          <Celula rotulo="Tela">{v.tecnicos?.multimidia?.telaPolegadas ?? <Vazio />}</Celula>
                          <Celula rotulo="CarPlay"><ResumoProjecao {...p.carplay} /></Celula>
                          <Celula rotulo="Android Auto"><ResumoProjecao {...p.androidAuto} /></Celula>
                          <Celula rotulo="Palheta dianteira">{pal.dianteira ?? <Vazio />}</Celula>
                          <Celula rotulo="Palheta traseira">{pal.traseira ?? <Vazio />}</Celula>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/** Célula da lista: no celular mostra o rótulo em cima; no computador o cabeçalho faz esse papel. */
function Celula({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <span className="min-w-0 text-sm">
      <span className="block text-[11px] text-muted-foreground md:hidden">{rotulo}</span>
      <span className={typeof children === "string" ? "line-clamp-2" : undefined}>{children}</span>
    </span>
  );
}

function Vazio() {
  return <span className="text-xs text-muted-foreground">sem info</span>;
}
