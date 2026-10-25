import Link from "next/link";
import { ArrowRight, BarChart3, Car, Crown, Lightbulb, Search, Truck, Wifi, Wind } from "lucide-react";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { resumoPalhetas } from "@/components/tecnico/conectividade";
import { Button } from "@/components/ui/button";
import { projecaoSemFio, rotuloConexao } from "@/lib/classificacao";
import { buscarEmplacamentos, ligarAoCatalogo } from "@/lib/dados/emplacamentos";
import { buscarSegmentos } from "@/lib/dados/segmentos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { calcularOportunidades, nomeVeiculo } from "@/lib/oportunidades";
import { montarRankings, resumoPorClasse, resumoPremium, type BlocoRanking, type ItemRanking } from "@/lib/rankings";
import type { Veiculo } from "@/lib/tipos";
import { formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ATALHOS = [
  { rotulo: "CarPlay/Android Auto sem fio", href: "/veiculos?conexao=sem-fio" },
  { rotulo: "Funciona por cabo (Streambox)", href: "/veiculos?conexao=cabo" },
  { rotulo: "Com medida de palheta", href: "/veiculos?palhetas=com" },
  { rotulo: "Ver por marca", href: "/montadoras" },
];

const ICONES: Record<string, typeof Car> = {
  geral: BarChart3,
  populares: Car,
  suvs: Car,
  sedas: Car,
  picapes: Truck,
  premium: Crown,
};

function porcentagem(n: number, casas = 1) {
  return `${n.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

export default async function PaginaInicio() {
  const [todos, emplacamentos, segmentos] = await Promise.all([buscarVeiculos(), buscarEmplacamentos(), buscarSegmentos()]);
  const publicados = todos.filter((v) => v.completude?.publicavel);
  const comSemFio = publicados.filter((v) => projecaoSemFio(v) !== "nenhuma").length;
  const comPalheta = publicados.filter((v) => resumoPalhetas(v.tecnicos?.palhetas).dianteira).length;

  const ultimoMes = emplacamentos.filter((e) => e.tipo === "mensal").map((e) => e.periodo).sort().at(-1);
  const nomeMes = (periodo: string | null | undefined) =>
    periodo ? new Date(`${periodo}T12:00:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }) : "";

  // Geral: automóveis e comerciais leves juntos (a Strada é comercial leve).
  const geral: BlocoRanking | null = ultimoMes
    ? {
        chave: "geral",
        titulo: "Geral",
        explicacao: "Todos os carros e picapes juntos.",
        fonte: "Fenabrave",
        fonteUrl: emplacamentos.find((e) => e.periodo === ultimoMes)?.fonteUrl ?? null,
        itens: ligarAoCatalogo(
          emplacamentos
            .filter((e) => e.tipo === "mensal" && e.periodo === ultimoMes)
            .sort((a, b) => b.unidades - a.unidades)
            .slice(0, 10)
            .map((e, i) => ({ ...e, posicao: i + 1 })),
          todos,
        ),
      }
    : null;
  const blocos = [...(geral ? [geral] : []), ...montarRankings(segmentos.linhas, todos)];
  const classes = resumoPorClasse(segmentos.participacao, segmentos.linhas);
  const lideres = new Map(
    ligarAoCatalogo(classes.flatMap((c) => (c.lider ? [c.lider] : [])), todos).map((l) => [l.segmentoFonte, l]),
  );
  const premium = resumoPremium(segmentos.linhas);
  const logos = new Map(todos.flatMap((v) => (v.montadora?.logotipoUrl ? [[v.montadoraSlug, v.montadora.logotipoUrl] as const] : [])));
  const { oportunidades } = calcularOportunidades(todos, emplacamentos);

  const numeros = [
    { titulo: "Modelos no site", valor: publicados.length, href: "/veiculos", icone: Car },
    { titulo: "Com CarPlay/Android Auto sem fio", valor: comSemFio, href: "/veiculos?conexao=sem-fio", icone: Wifi },
    { titulo: "Com medida de palheta", valor: comPalheta, href: "/veiculos?palhetas=com", icone: Wind },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
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
              placeholder="Ex.: Onix, Kicks, Tera, BMW X1"
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

      {blocos.length ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Mais vendidos de {nomeMes(segmentos.periodo ?? ultimoMes)}</h2>
              <p className="text-sm text-muted-foreground">
                Top 10 de cada categoria, com o CarPlay/Android Auto de cada carro: por cabo (Streambox) e sem fio.
              </p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mercado">
                Ranking completo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {blocos.map((b) => (
              <BlocoTop key={b.chave} bloco={b} logos={logos} />
            ))}
          </div>
        </section>
      ) : null}

      {classes.length ? (
        <section className="rounded-xl border bg-card">
          <div className="border-b p-5">
            <h2 className="text-lg font-semibold tracking-tight">Como as vendas se dividem por classe</h2>
            <p className="text-sm text-muted-foreground">
              Fatia de cada classe nos automóveis vendidos em {nomeMes(segmentos.periodo)}, pela classificação oficial da Fenabrave. Picapes
              ficam à parte, nos comerciais leves.
            </p>
          </div>
          <ul className="divide-y">
            {classes.map((c) => {
              const lider = lideres.get(c.segmento);
              return (
                <li key={c.segmento} className="grid gap-2 px-5 py-3 md:grid-cols-[1.4fr_2fr_1.6fr] md:items-center">
                  <div>
                    <p className="font-medium">{c.segmento}</p>
                    {c.explicacao ? <p className="text-xs text-muted-foreground">{c.explicacao}</p> : null}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(c.participacao, 0.5)}%` }} />
                    </div>
                    <span className="w-14 text-right text-sm font-semibold tabular-nums">{porcentagem(c.participacao)}</span>
                    <span
                      className={`w-20 text-right text-xs tabular-nums ${
                        c.variacao === null || c.variacao === 0 ? "text-muted-foreground" : c.variacao > 0 ? "text-success" : "text-destructive"
                      }`}
                      title="Diferença para o mês anterior, em pontos percentuais"
                    >
                      {c.variacao === null ? "" : `${c.variacao > 0 ? "+" : ""}${c.variacao.toLocaleString("pt-BR")} p.p.`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {lider ? (
                      <>
                        Líder:{" "}
                        {lider.veiculo?.completude?.publicavel ? (
                          <Link href={`/veiculos/${lider.veiculo.slug}`} className="font-medium text-foreground hover:text-primary">
                            {nomeVeiculo(lider.veiculo)}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">{nomeFonte(lider)}</span>
                        )}{" "}
                        ({formatarNumero(lider.unidades)})
                      </>
                    ) : null}
                  </p>
                </li>
              );
            })}
            {premium.marcas.length ? (
              <li className="grid gap-2 bg-muted/30 px-5 py-3 md:grid-cols-[1.4fr_3.6fr] md:items-center">
                <div>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Crown className="h-4 w-4 text-highlight" /> Premium
                  </p>
                  <p className="text-xs text-muted-foreground">Marcas de luxo, em todas as classes</p>
                </div>
                <p className="text-sm">
                  <span className="font-semibold tabular-nums">{formatarNumero(premium.totalMarcas)}</span> carros no mês ·{" "}
                  <span className="text-muted-foreground">
                    {premium.marcas
                      .slice(0, 5)
                      .map((m) => `${m.marca === "M.BENZ" ? "Mercedes-Benz" : titulo(m.marca)} ${formatarNumero(m.unidades)}`)
                      .join(" · ")}
                  </span>
                </p>
              </li>
            ) : null}
          </ul>
          <p className="border-t px-5 py-3 text-xs text-muted-foreground">
            Fontes:{" "}
            <a href={segmentos.participacao[0]?.fonteUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              informativo da Fenabrave ↗
            </a>
            {premium.fonteUrl ? (
              <>
                {" · "}
                <a href={premium.fonteUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
                  premium: Bright Consulting, via CarBlog ↗
                </a>
              </>
            ) : null}
            . A Fenabrave não separa carros turbo; ela classifica por carroceria e tamanho.
          </p>
        </section>
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
            ou internet (a conferir). A busca por novos modelos, vendas e dados roda automaticamente duas vezes por mês.
          </p>
        </div>
      </section>
    </div>
  );
}

function titulo(s: string) {
  return s.length <= 3 ? s : s.charAt(0) + s.slice(1).toLowerCase();
}

/** Nome como a fonte publica, quando o modelo não está no catálogo ("PORSCHE/CAYENNE" → "Porsche CAYENNE"). */
function nomeFonte(item: { marca: string; modelo: string }) {
  const marca = item.marca === "M.BENZ" ? "Mercedes-Benz" : item.marca === "GM" ? "Chevrolet" : titulo(item.marca);
  return `${marca} ${item.modelo}`.trim();
}

function BlocoTop({ bloco, logos }: { bloco: BlocoRanking; logos: Map<string, string> }) {
  const Icone = ICONES[bloco.chave] ?? Car;
  const primeiros = bloco.itens.slice(0, 5);
  const resto = bloco.itens.slice(5);
  return (
    <div className="flex flex-col rounded-xl border bg-card">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span className="mt-0.5 rounded-md bg-primary/10 p-1.5 text-primary">
          <Icone className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold">{bloco.titulo}</h3>
          <p className="text-xs text-muted-foreground">{bloco.explicacao}</p>
        </div>
      </div>
      <ol className="divide-y">
        {primeiros.map((item) => (
          <LinhaRanking key={`${item.marca}/${item.modelo}`} item={item} logos={logos} />
        ))}
      </ol>
      {resto.length ? (
        <details className="group border-t">
          <summary className="cursor-pointer list-none px-5 py-2 text-xs font-medium text-primary hover:bg-accent">
            <span className="group-open:hidden">Ver do 6º ao {bloco.itens.length}º</span>
            <span className="hidden group-open:inline">Mostrar só os 5 primeiros</span>
          </summary>
          <ol className="divide-y border-t">
            {resto.map((item) => (
              <LinhaRanking key={`${item.marca}/${item.modelo}`} item={item} logos={logos} />
            ))}
          </ol>
        </details>
      ) : null}
      <p className="mt-auto border-t px-5 py-2 text-[11px] text-muted-foreground">
        Fonte:{" "}
        {bloco.fonteUrl ? (
          <a href={bloco.fonteUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
            {bloco.fonte} ↗
          </a>
        ) : (
          bloco.fonte
        )}
      </p>
    </div>
  );
}

function LinhaRanking({ item, logos }: { item: ItemRanking; logos: Map<string, string> }) {
  const v: Veiculo | undefined = item.veiculo;
  const publicado = !!v?.completude?.publicavel;
  const nome = v ? nomeVeiculo(v) : nomeFonte(item);
  const detalhe = publicado ? rotuloConexao(v!) : v ? "CarPlay/Android Auto em pesquisa" : "Ainda não cadastrado";
  const anterior = item.unidadesMesAnterior;
  const variacao = anterior && anterior > 0 ? Math.round(((item.unidades - anterior) / anterior) * 100) : null;
  const conteudo = (
    <>
      <span className="w-6 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{item.posicao}º</span>
      <LogoMontadora
        nome={v?.marca ?? item.marca}
        slug={item.montadoraSlug ?? ""}
        logotipoUrl={v?.montadora?.logotipoUrl ?? logos.get(item.montadoraSlug ?? "") ?? null}
        tamanho="sm"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{nome}</span>
        <span className={`block truncate text-xs ${publicado ? "text-muted-foreground" : "text-muted-foreground/70"}`}>{detalhe}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums">{formatarNumero(item.unidades)}</span>
        {variacao !== null ? (
          <span className={`block text-[11px] tabular-nums ${variacao > 0 ? "text-success" : variacao < 0 ? "text-destructive" : "text-muted-foreground"}`}>
            {variacao > 0 ? "+" : ""}
            {variacao}% no mês
          </span>
        ) : null}
      </span>
    </>
  );
  return (
    <li>
      {publicado ? (
        <Link href={`/veiculos/${v!.slug}`} className="flex items-center gap-3 px-5 py-2.5 hover:bg-accent">
          {conteudo}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-5 py-2.5">{conteudo}</div>
      )}
    </li>
  );
}
