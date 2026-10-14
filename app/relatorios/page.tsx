import { Download, FileText } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RELATORIOS } from "@/lib/dados-demo";
import { formatarData } from "@/lib/utils";

export const metadata = {
  title: "Relatórios semanais",
};

const corTipo = {
  Lançamento: "default",
  Atualização: "secondary",
  "Mudança técnica": "warning",
  Oportunidade: "success",
} as const;

export default function PaginaRelatorios() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Relatórios semanais"
        descricao="Síntese automatizada das novidades da semana — toda segunda-feira. Inclui veículos, multimídia, componentes, mercado e oportunidades. Exportável em PDF e Excel."
      />

      <AlertaDemo mensagem="Relatórios reais serão gerados automaticamente a partir da Iteração 11 (agendamento semanal) e exportáveis em PDF/XLSX a partir da Iteração 12." />

      <div className="space-y-6">
        {RELATORIOS.map((r) => (
          <Card key={r.semana}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Relatório semana {r.semana}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Gerado em {formatarData(r.dataGeracao)} · {r.totalNovidades}{" "}
                      novidades · {r.totalOportunidades} oportunidades
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Download className="h-4 w-4" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {r.fatos.map((f, idx) => (
                <div
                  key={idx}
                  className="rounded-md border p-4 text-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{f.titulo}</p>
                    <Badge variant={corTipo[f.tipo]}>{f.tipo}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">{f.resumo}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
