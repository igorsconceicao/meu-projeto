import Link from "next/link";
import { Download, FileSpreadsheet } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import type { Veiculo } from "@/lib/tipos";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Relatórios" };

/** Agrupa os modelos pelo dia em que entraram no cadastro. */
function porDia(veiculos: Veiculo[]) {
  const mapa = new Map<string, Veiculo[]>();
  for (const v of veiculos) {
    const dia = (v.criadoEm ?? "").slice(0, 10);
    if (!dia) continue;
    mapa.set(dia, [...(mapa.get(dia) ?? []), v]);
  }
  return [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0]));
}

export default async function PaginaRelatorios() {
  const veiculos = await buscarVeiculos();
  const publicados = veiculos.filter((v) => v.completude?.publicavel);
  const rodadas = porDia(veiculos);

  // Pendência obrigatória mais comum por marca
  const marcas = new Map<string, { nome: string; slug: string; pub: number; ver: number; faltas: Map<string, number> }>();
  for (const v of veiculos) {
    const m = marcas.get(v.montadoraSlug) ?? { nome: v.marca, slug: v.montadoraSlug, pub: 0, ver: 0, faltas: new Map() };
    if (v.completude?.publicavel) m.pub++;
    else {
      m.ver++;
      for (const i of v.completude?.obrigatorios.filter((x) => !x.ok) ?? []) {
        m.faltas.set(i.rotulo, (m.faltas.get(i.rotulo) ?? 0) + 1);
      }
    }
    marcas.set(v.montadoraSlug, m);
  }
  const linhasMarcas = [...marcas.values()].sort((a, b) => b.pub + b.ver - (a.pub + a.ver));

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Relatórios"
        descricao="Histórico de cada rodada de atualização do catálogo e exportação dos dados técnicos em planilha (abre direto no Excel)."
        acoes={
          <>
            <Button asChild>
              <a href="/api/exportar" download>
                <Download className="h-4 w-4" />
                Baixar planilha
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/api/exportar?incluir=todos" download title="Inclui os modelos em verificação (requer login no admin)">
                <FileSpreadsheet className="h-4 w-4" />
                Planilha completa (admin)
              </a>
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Resumo titulo="Modelos cadastrados" valor={veiculos.length} />
        <Resumo titulo="Publicados" valor={publicados.length} />
        <Resumo titulo="Em verificação" valor={veiculos.length - publicados.length} />
        <Resumo titulo="Rodadas de coleta" valor={rodadas.length} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Situação por marca</CardTitle>
          <CardDescription>
            Quantos modelos de cada marca já estão completos e qual dado obrigatório mais falta nos que estão em verificação.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead className="text-right">Publicados</TableHead>
                <TableHead className="text-right">Em verificação</TableHead>
                <TableHead>O que mais falta</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhasMarcas.map((m) => {
                const falta = [...m.faltas.entries()].sort((a, b) => b[1] - a[1])[0];
                return (
                  <TableRow key={m.slug}>
                    <TableCell>
                      <Link href={`/montadoras/${m.slug}`} className="font-medium hover:text-primary">
                        {m.nome}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{m.pub}</TableCell>
                    <TableCell className="text-right tabular-nums">{m.ver}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {falta ? `${falta[0]} (${falta[1]})` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Histórico de rodadas</h2>
        {rodadas.map(([dia, lista]) => {
          const pub = lista.filter((v) => v.completude?.publicavel);
          return (
            <Card key={dia}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Rodada de {formatarData(dia)}</CardTitle>
                <CardDescription>
                  {lista.length} modelo{lista.length === 1 ? "" : "s"} cadastrado{lista.length === 1 ? "" : "s"} ·{" "}
                  {pub.length} já publicado{pub.length === 1 ? "" : "s"} · {lista.length - pub.length} em verificação
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1.5">
                {lista
                  .sort((a, b) => a.marca.localeCompare(b.marca) || a.nomeComercial.localeCompare(b.nomeComercial))
                  .map((v) =>
                    v.completude?.publicavel ? (
                      <Link key={v.id} href={`/veiculos/${v.slug}`}>
                        <Badge variant="success" className="hover:opacity-80">
                          {v.marca} {v.nomeComercial}
                        </Badge>
                      </Link>
                    ) : (
                      <Badge key={v.id} variant="secondary" title="Em verificação">
                        {v.marca} {v.nomeComercial}
                      </Badge>
                    ),
                  )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <p className="text-xs text-muted-foreground">
        Verde: modelo publicado (clique para abrir a ficha). Cinza: cadastrado, aguardando a informação de CarPlay/Android Auto.
      </p>
    </div>
  );
}

function Resumo({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
      </CardContent>
    </Card>
  );
}
