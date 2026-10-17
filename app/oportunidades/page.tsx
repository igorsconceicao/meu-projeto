import Link from "next/link";
import { ExternalLink, Lightbulb } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buscarEmplacamentos } from "@/lib/dados/emplacamentos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { calcularOportunidades } from "@/lib/oportunidades";
import { formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oportunidades de inovação" };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

export default async function PaginaOportunidades() {
  const [veiculos, emplacamentos] = await Promise.all([buscarVeiculos(), buscarEmplacamentos()]);
  const { oportunidades, periodoVendas } = calcularOportunidades(veiculos, emplacamentos);
  const mesVendas = periodoVendas ? `${MESES[Number(periodoVendas.slice(5, 7)) - 1]}/${periodoVendas.slice(0, 4)}` : null;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Oportunidades de inovação"
        descricao={`Produtos que a importadora pode desenvolver ou trazer, calculados cruzando o catálogo técnico (dados com fonte oficial) com o ranking de emplacamentos da Fenabrave${mesVendas ? ` (acumulado até ${mesVendas})` : ""}. Cada lista mostra o critério usado e a evidência de cada modelo — nada é estimado.`}
      />

      <nav className="flex flex-wrap gap-2">
        {oportunidades.map((o) => (
          <a key={o.chave} href={`#${o.chave}`} className="rounded-full border px-3 py-1 text-sm hover:bg-accent">
            {o.titulo} <span className="text-muted-foreground">({o.alvos.length})</span>
          </a>
        ))}
      </nav>

      {oportunidades.map((o) => (
        <Card key={o.chave} id={o.chave} className="scroll-mt-20">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-4 w-4 text-highlight" />
                {o.titulo}
              </CardTitle>
              <Badge variant="secondary">{o.alvos.length} modelo{o.alvos.length === 1 ? "" : "s"}</Badge>
            </div>
            <CardDescription>{o.porQue}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <div className="rounded-md border border-dashed p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Critério</p>
                <p className="mt-1">{o.criterio}</p>
              </div>
              <div className="rounded-md border border-dashed p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Validar antes de investir</p>
                <ul className="mt-1 list-disc space-y-0.5 pl-4">
                  {o.validar.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>

            {o.alvos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum modelo do catálogo atende a este critério hoje.</p>
            ) : (
              <ul className="divide-y rounded-md border">
                {o.alvos.map((a) => (
                  <li key={a.nome} className="flex flex-col gap-1 p-3 text-sm md:flex-row md:items-start md:justify-between md:gap-4">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.veiculo?.completude?.publicavel ? (
                          <Link href={`/veiculos/${a.veiculo.slug}`} className="font-medium hover:text-primary">
                            {a.nome}
                          </Link>
                        ) : a.veiculo ? (
                          <Link href={`/montadoras/${a.veiculo.montadoraSlug}`} className="font-medium hover:text-primary">
                            {a.nome}
                          </Link>
                        ) : (
                          <span className="font-medium">{a.nome}</span>
                        )}
                        {a.veiculo && !a.veiculo.completude?.publicavel ? (
                          <Badge variant="secondary" className="text-[10px]">em verificação</Badge>
                        ) : null}
                      </div>
                      {a.evidencia ? <p className="text-xs italic text-muted-foreground">“{a.evidencia}”</p> : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        {a.vendasAno !== null ? `${formatarNumero(a.vendasAno)} emplacados no ano` : "fora do top 50 de vendas"}
                      </span>
                      {a.fonteUrl ? (
                        <a href={a.fonteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                          fonte <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
