import { CheckCircle2, Lightbulb } from "lucide-react";
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
import { OPORTUNIDADES } from "@/lib/dados-demo";

export const metadata = {
  title: "Oportunidades de inovação",
};

const corPrioridade = {
  Alta: "destructive",
  Média: "warning",
  Baixa: "secondary",
} as const;

export default function PaginaOportunidades() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Oportunidades de inovação"
        descricao="Transformação dos dados coletados em recomendações para o laboratório. Cada oportunidade carrega veículo-alvo, evidências, pendências de validação e prioridade sugerida."
      />

      <AlertaDemo mensagem="Oportunidades reais aparecem após a Iteração 7, quando a coleta e a IA começam a cruzar lançamentos, reclamações e lacunas de catálogo." />

      <section className="grid gap-5 lg:grid-cols-2">
        {OPORTUNIDADES.map((o) => (
          <Card key={o.slug}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{o.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {o.categoria} · {o.veiculoAlvo}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={corPrioridade[o.prioridade]}>
                  {o.prioridade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p className="text-muted-foreground">{o.descricao}</p>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Evidências</p>
                  <p className="mt-1 flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {o.evidencias}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Pendências</p>
                  <p className="mt-1 font-semibold text-warning">
                    {o.pendencias.length}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  O que ainda precisa ser validado
                </p>
                <ul className="space-y-1 text-sm">
                  {o.pendencias.map((p, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
