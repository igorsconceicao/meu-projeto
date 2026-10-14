import { Building2 } from "lucide-react";
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
import { MONTADORAS } from "@/lib/dados-demo";

export const metadata = {
  title: "Montadoras",
};

export default function PaginaMontadoras() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Montadoras e marcas"
        descricao="Marcas acompanhadas pela plataforma. Novas montadoras podem ser adicionadas automaticamente ou pelo painel administrativo."
      />

      <AlertaDemo mensagem="As montadoras exibidas são fictícias. A base real de marcas (Chevrolet, Volkswagen, BYD, GWM, Toyota, etc.) será cadastrada a partir da Iteração 2." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MONTADORAS.map((m) => (
          <Card key={m.slug}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{m.nome}</CardTitle>
                    {m.grupo ? (
                      <CardDescription className="text-xs">
                        {m.grupo}
                      </CardDescription>
                    ) : null}
                  </div>
                </div>
                <Badge variant="demo">demo</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Origem</span>
                <span className="font-medium text-foreground">{m.pais}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Modelos monitorados</span>
                <span className="font-medium text-foreground">
                  {m.qtdModelos}
                </span>
              </div>
              {m.destaque ? (
                <p className="rounded-md border border-dashed bg-muted/40 p-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Destaque:</span>{" "}
                  {m.destaque}
                </p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
