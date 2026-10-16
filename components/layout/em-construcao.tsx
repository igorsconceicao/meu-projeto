import Link from "next/link";
import { ArrowRight, Construction } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Página de módulo ainda sem dados reais. Explica o que o módulo vai mostrar
 * e de onde virão os dados — sem exibir nenhum número fictício.
 */
export function EmConstrucao({
  titulo,
  descricao,
  vaiMostrar,
  fontes,
}: {
  titulo: string;
  descricao: string;
  vaiMostrar: string[];
  fontes: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina titulo={titulo} descricao={descricao} />

      <div className="flex items-start gap-3 rounded-lg border border-dashed p-4 text-sm">
        <Construction className="mt-0.5 h-4 w-4 shrink-0 text-highlight" />
        <div>
          <p className="font-medium">Módulo em construção</p>
          <p className="text-muted-foreground">
            Esta área só vai exibir informações quando houver dados reais com fonte. Nada aqui é
            preenchido com exemplos ou estimativas.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">O que vai aparecer aqui</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {vaiMostrar.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">De onde virão os dados</CardTitle>
            <CardDescription>Sempre com fonte, período e data de consulta.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {fontes.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/veiculos">
            Ver o catálogo de veículos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/montadoras">Ver montadoras</Link>
        </Button>
      </div>
    </div>
  );
}
