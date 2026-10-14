import { Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CODIGOS_OEM, VEICULOS } from "@/lib/dados-demo";

export const metadata = {
  title: "Busca por OEM",
};

function nomeVeiculo(slug: string) {
  const v = VEICULOS.find((x) => x.slug === slug);
  return v ? `${v.marca} ${v.nomeComercial} ${v.anoModelo}` : slug;
}

export default function PaginaBuscaOem() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Busca por código OEM"
        descricao="Pesquise um código OEM para encontrar veículos compatíveis, componentes substitutos e possíveis aplicações cruzadas."
      />

      <AlertaDemo mensagem="A busca ainda não está conectada ao banco de dados. A pesquisa semântica por OEM entra na Iteração 5." />

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar</CardTitle>
          <CardDescription>
            Informe código OEM, descrição ou veículo. A busca será semântica (encontra códigos próximos) e cruzada entre marcas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Ex.: 12345-ABC, interruptor quádruplo, Aurora Sedã..."
                aria-label="Campo de busca OEM"
              />
            </div>
            <Button type="button" disabled>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo atual (demo)</CardTitle>
          <CardDescription>
            Códigos cadastrados até agora. Nenhum destes OEM é real — todos têm confiança &quot;a confirmar&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Aplicações</TableHead>
                <TableHead>Confiança</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CODIGOS_OEM.map((o) => (
                <TableRow key={o.codigo}>
                  <TableCell className="font-mono text-xs">{o.codigo}</TableCell>
                  <TableCell>{o.descricao}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.categoria}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {o.aplicacoes.map(nomeVeiculo).join(" · ")}
                  </TableCell>
                  <TableCell>
                    <BadgeConfianca nivel={o.confianca} />
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
