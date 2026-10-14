import { ArrowDown, ArrowUp, BarChart3 } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
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
import { VENDAS } from "@/lib/dados-demo";
import { formatarNumero } from "@/lib/utils";

export const metadata = {
  title: "Mercado e vendas",
};

export default function PaginaMercado() {
  const totalEmplacamentos = VENDAS.reduce(
    (acc, v) => acc + v.emplacamentos,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Mercado e vendas"
        descricao="Rankings e evolução das vendas no mercado brasileiro. Fontes previstas: Fenabrave (emplacamentos), Anfavea (produção) e ABVE (elétricos)."
      />

      <AlertaDemo mensagem="Os números abaixo são fictícios. A integração com Fenabrave e Anfavea entra na Iteração 8 e sempre informará período, data de publicação e fonte." />

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total emplacamentos (mês demo)</CardDescription>
            <CardTitle className="text-3xl">
              {formatarNumero(totalEmplacamentos)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Setembro / 2026 — dados fictícios
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Modelo em alta</CardDescription>
            <CardTitle className="text-xl">ExemploEV CitySpark</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-success">
              <ArrowUp className="h-3 w-3" /> +40,8% vs mês anterior (demo)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Modelo em queda</CardDescription>
            <CardTitle className="text-xl">Placeholder Aurora</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="flex items-center gap-1 text-xs text-destructive">
              <ArrowDown className="h-3 w-3" /> -3,4% vs mês anterior (demo)
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Ranking de modelos</CardTitle>
            <CardDescription>
              Ordenado por emplacamentos no mês de referência.
            </CardDescription>
          </div>
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Emplacamentos</TableHead>
                <TableHead className="text-right">Variação</TableHead>
                <TableHead className="text-right">Participação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...VENDAS]
                .sort((a, b) => b.emplacamentos - a.emplacamentos)
                .map((v, idx) => (
                  <TableRow key={`${v.marca}-${v.modelo}`}>
                    <TableCell className="font-medium">{idx + 1}º</TableCell>
                    <TableCell>
                      <p className="font-medium">{v.modelo}</p>
                      <p className="text-xs text-muted-foreground">{v.marca}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{v.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatarNumero(v.emplacamentos)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          v.variacaoMensal >= 0 ? "text-success" : "text-destructive"
                        }
                      >
                        {v.variacaoMensal >= 0 ? "+" : ""}
                        {(v.variacaoMensal * 100).toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {(v.participacao * 100).toFixed(2)}%
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
