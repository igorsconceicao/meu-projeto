import { AlertTriangle, Database, DollarSign, PlayCircle, RefreshCw, Shield, Users } from "lucide-react";
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

export const metadata = {
  title: "Administração",
};

const cartoes = [
  {
    titulo: "Fontes de dados",
    descricao: "Cadastre, ative e desative fontes.",
    rodape: "0 fontes cadastradas",
    icone: Database,
    disponivelNa: "Iteração 6",
  },
  {
    titulo: "Rotina semanal",
    descricao: "Última execução, erros, próxima rodada.",
    rodape: "Aguardando primeira execução",
    icone: RefreshCw,
    disponivelNa: "Iteração 11",
  },
  {
    titulo: "Painel de custos",
    descricao: "Tokens, chamadas, custo por execução.",
    rodape: "US$ 0,00 este mês (sem consumo)",
    icone: DollarSign,
    disponivelNa: "Iteração 9",
  },
  {
    titulo: "Usuários e permissões",
    descricao: "Controle de acesso ao painel.",
    rodape: "Login será ativado na Iteração 3",
    icone: Users,
    disponivelNa: "Iteração 3",
  },
  {
    titulo: "Erros de coleta",
    descricao: "Falhas, timeouts e retentativas.",
    rodape: "Nenhum erro registrado",
    icone: AlertTriangle,
    disponivelNa: "Iteração 6",
  },
  {
    titulo: "Segurança",
    descricao: "Chaves de API, variáveis de ambiente, backups.",
    rodape: "Chaves apenas em .env.local / Vercel",
    icone: Shield,
    disponivelNa: "Iteração 2",
  },
];

export default function PaginaAdmin() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Administração"
        descricao="Painel para gerenciar fontes, usuários, orçamento de IA, consumos e segurança."
        acoes={
          <Button disabled>
            <PlayCircle className="h-4 w-4" />
            Executar atualização manual
          </Button>
        }
      />

      <AlertaDemo mensagem="O painel administrativo ainda não está conectado. Cada seção abaixo será ativada na iteração indicada no cartão." />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((c) => (
          <Card key={c.titulo}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {c.descricao}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="demo">{c.disponivelNa}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{c.rodape}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
