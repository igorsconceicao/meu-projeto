import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
import { Input } from "@/components/ui/input";
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
import { VEICULOS } from "@/lib/dados-demo";
import { formatarData, formatarPreco } from "@/lib/utils";

export const metadata = {
  title: "Veículos",
};

export default function PaginaVeiculos() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Catálogo de veículos"
        descricao="Fichas técnicas de modelos lançados ou atualizados a partir de janeiro de 2025. Cada veículo contém informações de multimídia, iluminação, palhetas, interruptores e códigos OEM com rastreabilidade de fontes."
      />

      <AlertaDemo />

      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Lista de veículos</CardTitle>
              <CardDescription>
                {VEICULOS.length} registros · todos marcados como demonstração
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Filtrar por marca ou modelo..."
                className="w-full sm:w-72"
                aria-label="Filtrar veículos"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veículo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Propulsão</TableHead>
                <TableHead>Lançamento BR</TableHead>
                <TableHead>Preço ref.</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Confiança</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {VEICULOS.map((v) => (
                <TableRow key={v.slug}>
                  <TableCell>
                    <Link
                      href={`/veiculos/${v.slug}`}
                      className="font-medium hover:underline"
                    >
                      {v.marca} {v.nomeComercial}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {v.geracao} · ano {v.anoModelo}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{v.propulsao}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatarData(v.dataLancamentoBr)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatarPreco(v.precoReferencia)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{v.situacao}</Badge>
                  </TableCell>
                  <TableCell>
                    <BadgeConfianca nivel={v.confianca} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/veiculos/${v.slug}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      Abrir
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
