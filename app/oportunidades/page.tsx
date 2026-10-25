import Link from "next/link";
import { ArrowDown, Lightbulb, MonitorSmartphone, Wifi, Wind } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarEmplacamentos } from "@/lib/dados/emplacamentos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { calcularOportunidades, type Alvo, type Certeza, type GrupoMedida, type Oportunidade } from "@/lib/oportunidades";
import { cn, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oportunidades" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const ICONE: Record<string, typeof Wifi> = {
  "adaptador-sem-fio": Wifi,
  palhetas: Wind,
  "central-multimidia": MonitorSmartphone,
  lampadas: Lightbulb,
};

const CERTEZA: Record<Certeza, { rotulo: string; classe: string; explica: string }> = {
  confirmado: { rotulo: "Confirmado", classe: "bg-success/15 text-success", explica: "a fonte diz claramente" },
  parcial: { rotulo: "Algumas versões", classe: "bg-warning/15 text-warning", explica: "vale só para parte das versões" },
  conferir: { rotulo: "Conferir", classe: "bg-muted text-muted-foreground", explica: "a fonte não deixa claro; confirme antes de investir" },
};

/** Quantos modelos aparecem antes do “ver todos”. */
const VISIVEIS = 10;

function Etiqueta({ certeza }: { certeza: Certeza }) {
  const c = CERTEZA[certeza];
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", c.classe)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {c.rotulo}
    </span>
  );
}

function NomeModelo({ a }: { a: Alvo }) {
  if (a.veiculo?.completude?.publicavel) {
    return (
      <Link href={`/veiculos/${a.veiculo.slug}`} className="font-medium hover:text-primary">
        {a.nome}
      </Link>
    );
  }
  if (a.veiculo) {
    return (
      <Link href={`/montadoras/${a.veiculo.montadoraSlug}`} className="font-medium hover:text-primary">
        {a.nome}
      </Link>
    );
  }
  return <span className="font-medium">{a.nome}</span>;
}

function Vendas({ a }: { a: Alvo }) {
  if (a.vendasAno === null) return <span className="text-muted-foreground">fora do top 50</span>;
  return (
    <span className="tabular-nums" title={a.vendasFamilia ? `Família ${a.vendasFamilia}, todas as versões` : undefined}>
      {formatarNumero(a.vendasAno)}
      {a.vendasFamilia ? "*" : ""}
    </span>
  );
}

function LinhaModelo({ a }: { a: Alvo }) {
  return (
    <li className="grid gap-1 px-3 py-2.5 text-sm md:grid-cols-[1.3fr_1.7fr_7rem] md:items-center md:gap-4">
      <NomeModelo a={a} />
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <Etiqueta certeza={a.certeza} />
        <span>{a.situacao}</span>
        {a.fonteUrl ? (
          <a href={a.fonteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
            fonte ↗
          </a>
        ) : null}
      </div>
      <div className="text-xs md:text-right md:text-sm">
        <span className="text-muted-foreground md:hidden">Vendidos no ano: </span>
        <Vendas a={a} />
      </div>
    </li>
  );
}

function ListaModelos({ alvos, rotuloVendas }: { alvos: Alvo[]; rotuloVendas: string }) {
  if (!alvos.length) return <p className="text-sm text-muted-foreground">Nenhum modelo do catálogo se encaixa nisto hoje.</p>;
  const primeiros = alvos.slice(0, VISIVEIS);
  const resto = alvos.slice(VISIVEIS);
  return (
    <div className="rounded-md border">
      <div className="hidden grid-cols-[1.3fr_1.7fr_7rem] gap-4 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground md:grid">
        <span>Modelo</span>
        <span>O que o carro tem hoje</span>
        <span className="text-right">{rotuloVendas}</span>
      </div>
      <ul className="divide-y">
        {primeiros.map((a) => (
          <LinhaModelo key={a.nome} a={a} />
        ))}
      </ul>
      {resto.length ? (
        <details className="border-t">
          <summary className="cursor-pointer px-3 py-2 text-sm text-primary hover:underline">
            Ver os outros {resto.length} modelos
          </summary>
          <ul className="divide-y border-t">
            {resto.map((a) => (
              <LinhaModelo key={a.nome} a={a} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function TabelaMedidas({
  titulo,
  descricao,
  itens,
  rotuloVendas,
}: {
  titulo: string;
  descricao: string;
  itens: GrupoMedida[];
  rotuloVendas: string;
}) {
  if (!itens.length) return null;
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">{titulo}</p>
        <p className="text-xs text-muted-foreground">{descricao}</p>
      </div>
      <div className="hidden grid-cols-[7rem_1fr_7rem] gap-4 px-3 text-xs font-medium text-muted-foreground md:grid">
        <span>Medida</span>
        <span>Carros que usam</span>
        <span className="text-right">{rotuloVendas}</span>
      </div>
      <ul className="divide-y rounded-md border">
        {itens.slice(0, 8).map((g) => (
          <li key={g.medida} className="grid gap-1 px-3 py-2.5 text-sm md:grid-cols-[7rem_1fr_7rem] md:items-start md:gap-4">
            <span className="font-semibold tabular-nums">{g.medida}</span>
            <span className="text-muted-foreground">
              {g.alvos.slice(0, 6).map((a, i) => (
                <span key={a.nome}>
                  {i ? ", " : ""}
                  <NomeModelo a={a} />
                </span>
              ))}
              {g.alvos.length > 6 ? ` e mais ${g.alvos.length - 6}` : ""}
              {g.aConferir ? <span className="ml-2 text-xs">(inclui medidas a conferir)</span> : null}
            </span>
            <span className="text-xs md:text-right md:text-sm">
              <span className="text-muted-foreground md:hidden">Carros vendidos: </span>
              <span className="tabular-nums">{g.vendas ? formatarNumero(g.vendas) : "—"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CartaoResumo({ o, periodo }: { o: Oportunidade; periodo: string | null }) {
  const Icone = ICONE[o.chave] ?? Lightbulb;
  const confirmados = o.alvos.filter((a) => a.certeza === "confirmado").length;
  const principais = o.alvos.filter((a) => a.vendasAno !== null).sort((a, b) => (b.vendasAno ?? 0) - (a.vendasAno ?? 0)).slice(0, 3);
  return (
    <a href={`#${o.chave}`} className="group flex flex-col gap-3 rounded-xl border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icone className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="font-semibold leading-tight">{o.titulo}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{o.oQueE}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xl font-bold tabular-nums">{o.alvos.length}</p>
          <p className="text-[11px] text-muted-foreground">
            modelos{confirmados && o.chave !== "palhetas" ? ` · ${confirmados} confirmados` : ""}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-xl font-bold tabular-nums">{o.vendasTotal ? formatarNumero(o.vendasTotal) : "—"}</p>
          <p className="text-[11px] text-muted-foreground">carros vendidos{periodo ? ` (${periodo})` : ""}</p>
        </div>
      </div>
      {principais.length ? (
        <p className="text-xs text-muted-foreground">
          Mais vendidos: <span className="text-foreground">{principais.map((a) => a.nome).join(", ")}</span>
        </p>
      ) : null}
      <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">
        Ver detalhes <ArrowDown className="h-3 w-3 transition-transform group-hover:translate-y-0.5" />
      </span>
    </a>
  );
}

export default async function PaginaOportunidades() {
  const [veiculos, emplacamentos] = await Promise.all([buscarVeiculos(), buscarEmplacamentos()]);
  const { oportunidades, semDados, periodoVendas } = calcularOportunidades(veiculos, emplacamentos);
  const periodo = periodoVendas
    ? `jan–${MESES[Number(periodoVendas.slice(5, 7)) - 1]}/${periodoVendas.slice(0, 4)}`
    : null;
  const rotuloVendas = periodo ? `Vendidos (${periodo})` : "Vendidos no ano";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <CabecalhoPagina
        titulo="Oportunidades"
        descricao="Onde a importadora pode vender ou desenvolver produtos, olhando o que os carros mais vendidos do Brasil têm, ou não têm, de fábrica."
      />

      <section className="rounded-xl border bg-card p-5">
        <p className="font-medium">Como esta página funciona</p>
        <ol className="mt-3 grid gap-4 text-sm md:grid-cols-3">
          {[
            ["O que o carro tem de fábrica", "Vem do catálogo: CarPlay/Android Auto, palhetas, faróis. Cada dado tem link da fonte."],
            [
              "Quanto ele vende",
              `Emplacamentos oficiais da Fenabrave${periodo ? ` (${periodo})` : ""}, entre os 50 automóveis e os 50 comerciais leves mais vendidos.`,
            ],
            ["Onde está a oportunidade", "Carro que vende muito e não tem o recurso de fábrica = público para o produto. Nada é estimado."],
          ].map(([titulo, texto], i) => (
            <li key={titulo} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span>
                <span className="font-medium">{titulo}.</span> <span className="text-muted-foreground">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs text-muted-foreground">
          {(Object.keys(CERTEZA) as Certeza[]).map((c) => (
            <span key={c} className="flex items-center gap-1.5">
              <Etiqueta certeza={c} /> {CERTEZA[c].explica}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {oportunidades.map((o) => (
            <CartaoResumo key={o.chave} o={o} periodo={periodo} />
          ))}
        </div>
      </section>

      {oportunidades.map((o) => {
        const Icone = ICONE[o.chave] ?? Lightbulb;
        return (
          <Card key={o.chave} id={o.chave} className="scroll-mt-20">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Icone className="h-5 w-5 text-primary" />
                  {o.titulo}
                </CardTitle>
                <Badge variant="secondary">
                  {o.alvos.length} modelo{o.alvos.length === 1 ? "" : "s"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 text-sm md:grid-cols-3">
                {[
                  ["O que é", o.oQueE],
                  ["O produto", o.produto],
                  ["Como escolhemos os modelos", o.comoEscolhemos],
                ].map(([titulo, texto]) => (
                  <div key={titulo} className="rounded-lg bg-muted/40 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{titulo}</p>
                    <p className="mt-1">{texto}</p>
                  </div>
                ))}
              </div>

              {o.grupos?.map((g) => (
                <TabelaMedidas key={g.titulo} titulo={g.titulo} descricao={g.descricao} itens={g.itens} rotuloVendas={rotuloVendas} />
              ))}

              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {o.grupos ? "Todos os modelos com medida, do mais vendido para o menos" : "Modelos: primeiro os confirmados, depois os mais vendidos"}
                </p>
                <ListaModelos alvos={o.alvos} rotuloVendas={rotuloVendas} />
              </div>

              <div className="rounded-lg border border-dashed p-3 text-sm">
                <p className="font-medium">Antes de investir, confirme</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
                  {o.validar.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {semDados.length ? (
        <section className="rounded-xl border bg-card p-5 text-sm">
          <p className="font-medium">Mais vendidos que ainda não dá para avaliar</p>
          <p className="mt-1 text-muted-foreground">
            Estão entre os mais emplacados, mas ainda faltam dados no catálogo, por isso ficam fora das listas acima.
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {[
              { titulo: "Ainda não cadastrados no catálogo", itens: semDados.filter((a) => !a.veiculo) },
              { titulo: "Cadastrados, mas sem fonte de CarPlay/Android Auto", itens: semDados.filter((a) => a.veiculo) },
            ]
              .filter((g) => g.itens.length)
              .map((g) => (
                <div key={g.titulo}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{g.titulo}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {g.itens.slice(0, 12).map((a) => (
                      <li key={a.nome} className="rounded-full border px-3 py-1">
                        <NomeModelo a={a} />{" "}
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {a.vendasAno !== null ? formatarNumero(a.vendasAno) : ""}
                        </span>
                      </li>
                    ))}
                    {g.itens.length > 12 ? (
                      <li className="px-1 py-1 text-xs text-muted-foreground">e mais {g.itens.length - 12} com menos vendas</li>
                    ) : null}
                  </ul>
                </div>
              ))}
          </div>
        </section>
      ) : null}

      <p className="text-xs text-muted-foreground">
        * Vendas da família inteira do modelo (todas as versões somadas pela Fenabrave). As somas consideram só os modelos que aparecem
        entre os 50 mais vendidos de cada segmento.
      </p>
    </div>
  );
}
