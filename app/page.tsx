import Link from "next/link";
import { ArrowRight, BarChart3, Car, Lightbulb, Search, Wifi, Wind } from "lucide-react";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { MiniEstado, resumoPalhetas } from "@/components/tecnico/conectividade";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projecaoSemFio } from "@/lib/classificacao";
import { buscarEmplacamentos, ligarAoCatalogo } from "@/lib/dados/emplacamentos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { calcularOportunidades } from "@/lib/oportunidades";
import { formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ATALHOS = [
  { rotulo: "CarPlay/Android Auto sem fio", href: "/veiculos?conexao=sem-fio" },
  { rotulo: "Sem fio não confirmado", href: "/veiculos?conexao=so-cabo" },
  { rotulo: "Com medida de palheta", href: "/veiculos?palhetas=com" },
  { rotulo: "Ver por marca", href: "/montadoras" },
];

export default async function PaginaInicio() {
  const [todos, emplacamentos] = await Promise.all([buscarVeiculos(), buscarEmplacamentos()]);
  const publicados = todos.filter((v) => v.completude?.publicavel);
  const comSemFio = publicados.filter((v) => projecaoSemFio(v) !== "nenhuma").length;
  const comPalheta = publicados.filter((v) => resumoPalhetas(v.tecnicos?.palhetas).dianteira).length;

  const ultimoMes = emplacamentos.filter((e) => e.tipo === "mensal").map((e) => e.periodo).sort().at(-1);
  const maisVendidos = ultimoMes
    ? ligarAoCatalogo(
        emplacamentos.filter((e) => e.tipo === "mensal" && e.periodo === ultimoMes && e.segmento === "Automóveis").slice(0, 10),
        todos,
      )
    : [];
  const nomeMes = ultimoMes
    ? new Date(`${ultimoMes}T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    : "";
  const { oportunidades } = calcularOportunidades(todos, emplacamentos);

  const numeros = [
    { titulo: "Modelos no site", valor: publicados.length, href: "/veiculos", icone: Car },
    { titulo: "Com CarPlay/Android Auto sem fio", valor: comSemFio, href: "/veiculos?conexao=sem-fio", icone: Wifi },
    { titulo: "Com medida de palheta", valor: comPalheta, href: "/veiculos?palhetas=com", icone: Wind },
  ];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <section className="rounded-2xl border bg-card p-6 md:p-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Qual veículo você quer consultar?</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          CarPlay e Android Auto (cabo e sem fio), tela da central e palhetas de cada modelo vendido no Brasil.
        </p>
        <form action="/veiculos" className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder="Ex.: Onix, Kicks, Tera, Haval H6"
              className="h-12 w-full rounded-lg border border-input bg-background pl-11 pr-3 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Modelo do veículo"
            />
          </div>
          <Button type="submit" size="lg" className="h-12">
            Buscar
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {ATALHOS.map((a) => (
            <Link key={a.href} href={a.href} className="rounded-full border px-3 py-1 text-sm hover:border-primary/60 hover:bg-accent">
              {a.rotulo}
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {numeros.map(({ titulo, valor, href, icone: Icone }) => (
          <Link key={titulo} href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary/50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{titulo}</span>
              <Icone className="h-4 w-4" />
            </div>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{formatarNumero(valor)}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
              Ver lista <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      {maisVendidos.length ? (
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                Carros mais vendidos em {nomeMes}
              </CardTitle>
              <CardDescription>Ranking oficial da Fenabrave, com o CarPlay/Android Auto sem fio de cada um.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mercado">
                Top 50 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {maisVendidos.map((e) => {
                const v = e.veiculo;
                const publicado = v?.completude?.publicavel;
                const semFio = publicado ? projecaoSemFio(v!) : null;
                const conteudo = (
                  <>
                    <span className="w-6 text-right text-sm tabular-nums text-muted-foreground">{e.posicao}º</span>
                    {v ? (
                      <LogoMontadora nome={v.marca} slug={v.montadoraSlug} logotipoUrl={v.montadora?.logotipoUrl ?? null} tamanho="sm" />
                    ) : (
                      <span className="w-8" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{e.marca}/{e.modelo}</span>
                      <span className="text-xs text-muted-foreground">{formatarNumero(e.unidades)} unidades</span>
                    </span>
                    <span className="shrink-0 text-right">
                      {semFio === null ? (
                        <span className="text-xs text-muted-foreground">{v ? "aguardando dados" : "fora do catálogo"}</span>
                      ) : (
                        <span className="flex flex-col items-end gap-0.5">
                          <span className="text-[11px] text-muted-foreground">sem fio</span>
                          <MiniEstado estado={semFio === "todas" ? "confirmado" : semFio === "algumas" ? "depende_versao" : "nao_identificado"} />
                        </span>
                      )}
                    </span>
                  </>
                );
                return (
                  <li key={e.posicao}>
                    {publicado ? (
                      <Link href={`/veiculos/${v!.slug}`} className="flex items-center gap-3 px-6 py-3 hover:bg-accent">
                        {conteudo}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3 px-6 py-3">{conteudo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2">
        <Link href="/oportunidades" className="group rounded-xl border bg-card p-5 hover:border-primary/50">
          <p className="flex items-center gap-2 font-medium">
            <Lightbulb className="h-4 w-4 text-highlight" /> Oportunidades para o laboratório
          </p>
          <ul className="mt-2 space-y-0.5 text-sm text-muted-foreground">
            {oportunidades.slice(0, 3).map((o) => (
              <li key={o.chave} className="flex justify-between gap-2">
                <span className="truncate">{o.titulo}</span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">{o.alvos.length}</span>
              </li>
            ))}
          </ul>
        </Link>
        <div className="rounded-xl border bg-card p-5 text-sm">
          <p className="font-medium">Como os dados são coletados</p>
          <p className="mt-2 text-muted-foreground">
            Cada informação guarda o link e o trecho da fonte. Na ficha, a etiqueta mostra o tipo de fonte: fonte oficial, imprensa/catálogo
            ou internet (a conferir). A busca por novos modelos e dados roda automaticamente duas vezes por mês.
          </p>
        </div>
      </section>
    </div>
  );
}
