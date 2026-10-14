import { Flame, MessageSquare, TrendingUp } from "lucide-react";
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
import { ACESSORIOS, OPINIOES } from "@/lib/dados-demo";

export const metadata = {
  title: "Tendências e consumidores",
};

const corSentimento = {
  positivo: "success",
  negativo: "destructive",
  misto: "warning",
} as const;

export default function PaginaTendencias() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Tendências e consumidores"
        descricao="Assuntos recorrentes em fóruns, reviews e redes sociais, acessórios em alta no mercado de reposição. Fontes consideradas: Reddit, YouTube, blogs especializados, Google Trends."
      />

      <AlertaDemo mensagem="As opiniões e acessórios exibidos são fictícios. A coleta real de tendências entra nas Iterações 6 e 9." />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Opiniões recorrentes</CardTitle>
                <CardDescription>
                  Comentários isolados nunca são apresentados como consenso.
                </CardDescription>
              </div>
              <MessageSquare className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {OPINIOES.map((o, idx) => (
              <div key={idx} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{o.tema}</p>
                  <Badge variant={corSentimento[o.sentimento]}>
                    {o.sentimento}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {o.veiculo} · {o.recorrencia} relatos · {o.periodo}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {o.resumo}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Acessórios em alta</CardTitle>
                <CardDescription>
                  Popularidade e demanda não se confundem — a plataforma distingue claramente ambas.
                </CardDescription>
              </div>
              <Flame className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {ACESSORIOS.map((a, idx) => (
              <div key={idx} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{a.nome}</p>
                  <Badge variant="secondary">{a.categoria}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Aplicações: {a.veiculosAlvo.join(", ")}
                </p>
                <div className="mt-2 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1 text-success">
                    <TrendingUp className="h-3 w-3" />
                    {a.evidenciasDemanda} evidências de demanda
                  </span>
                  <span className="text-muted-foreground">
                    {a.concorrentes} concorrentes
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {a.observacao}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
