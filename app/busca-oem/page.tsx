import Link from "next/link";
import { Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { buscarNoCatalogo } from "@/lib/busca";
import { buscarVeiculosPublicados } from "@/lib/dados/veiculos";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Busca por código",
};

export default async function PaginaBuscaOem({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [r, publicados] = await Promise.all([buscarNoCatalogo(q), buscarVeiculosPublicados()]);

  // Cobertura atual da base de códigos (só modelos publicados).
  const comCodigo = publicados.filter((v) =>
    [...(v.tecnicos?.iluminacao ?? []), ...(v.tecnicos?.palhetas ?? []), ...(v.tecnicos?.interruptores ?? [])].some(
      (i) => ("codigo" in i && i.codigo) || i.oem,
    ),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Busca por código (lâmpada / OEM)"
        descricao="Digite um código padronizado de lâmpada (H4, H7, HB3...) ou um código OEM de palheta ou interruptor para ver em quais veículos ele aparece."
      />

      <Card>
        <CardContent className="pt-6">
          <form action="/busca-oem" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input name="q" defaultValue={q} className="pl-9" placeholder="Ex.: H7, HB3, 5U0955425..." aria-label="Código" />
            </div>
            <Button type="submit">Buscar</Button>
          </form>
        </CardContent>
      </Card>

      {q.trim() ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resultados para “{q}”</CardTitle>
          </CardHeader>
          <CardContent>
            {r.componentes.length ? (
              <ul className="divide-y rounded-md border">
                {r.componentes.map((c, i) => (
                  <li key={i}>
                    <Link href={`/veiculos/${c.veiculo.slug}`} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm hover:bg-accent">
                      <span className="font-mono font-medium">{c.codigo}</span>
                      <span className="text-muted-foreground">
                        {c.tipo} · {c.posicao} · {c.veiculo.marca} {c.veiculo.nomeComercial}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum componente com esse código nos modelos publicados.{" "}
                <Link href={`/busca?q=${encodeURIComponent(q)}`} className="text-primary hover:underline">
                  Buscar “{q}” no catálogo inteiro
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobertura da base de códigos</CardTitle>
          <CardDescription>
            Códigos só entram quando publicados em fonte oficial (manual do proprietário, catálogo de peças da montadora).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {comCodigo} de {publicados.length} modelos publicados têm pelo menos um código de lâmpada ou OEM confirmado.
          {comCodigo === 0
            ? " Os sites oficiais de venda não publicam esses códigos; a próxima etapa é buscá-los nos manuais do proprietário."
            : ""}
        </CardContent>
      </Card>
    </div>
  );
}
