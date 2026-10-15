import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import {
  OPORTUNIDADES,
  RESUMO_DASHBOARD,
  VENDAS,
} from "@/lib/dados-demo";
import { formatarData, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PaginaDashboard() {
  const [montadoras, veiculos] = await Promise.all([
    buscarMontadoras(),
    buscarVeiculos(),
  ]);

  const indicadores = [
    {
      titulo: "Veículos monitorados",
      valor: veiculos.length,
      icone: Car,
      descricao: "Catálogo técnico ativo",
    },
    {
      titulo: "Montadoras",
      valor: montadoras.length,
      icone: Building2,
      descricao: "Marcas acompanhadas",
    },
    {
      titulo: "Novidades (2025)",
      valor: veiculos.filter((v) => (v.anoModelo ?? 0) >= 2025).length,
      icone: Sparkles,
      descricao: "Lançamentos recentes",
      destaque: true,
    },
    {
      titulo: "Oportunidades abertas",
      valor: OPORTUNIDADES.length,
      icone: Lightbulb,
      descricao: "Pendentes de Iteração 10",
    },
  ];

  const novidades = veiculos.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoPagina
        titulo="Dashboard"
        descricao="Visão geral da inteligência automotiva brasileira — veículos monitorados, novidades da semana e oportunidades para o laboratório."
        acoes={
          <>
            <Button variant="outline" asChild>
              <Link href="/relatorios">
                <FileText className="h-4 w-4" />
                Último relatório
              </Link>
            </Button>
            <Button asChild>
              <Link href="/veiculos">
                <Car className="h-4 w-4" />
                Explorar veículos
              </Link>
            </Button>
          </>
        }
      />

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicadores.map(({ titulo, valor, icone: Icone, descricao, destaque }) => (
          <Card
            key={titulo}
            className={
              destaque
                ? "border-highlight/50 bg-gradient-to-br from-highlight/5 via-card to-card"
                : undefined
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{titulo}</CardDescription>
                <Icone
                  className={
                    destaque
                      ? "h-4 w-4 text-highlight"
                      : "h-4 w-4 text-muted-foreground"
                  }
                />
              </div>
              <CardTitle className="text-3xl">
                {formatarNumero(valor)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{descricao}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Status da última atualização</CardTitle>
              <CardDescription>
                A rotina semanal roda toda segunda-feira às 09:00 (BRT) pelo GitHub Actions.
              </CardDescription>
            </div>
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Pronto
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Última execução
                </div>
                <p className="mt-2 text-sm font-medium">
                  {formatarData(RESUMO_DASHBOARD.ultimaExecucao)} · 09:12
                </p>
                <p className="text-xs text-muted-foreground">
                  Fontes consultadas: 0 reais · 0 novidades automatizadas
                </p>
              </div>
              <div className="rounded-md border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  Catálogo no banco
                </div>
                <p className="mt-2 text-sm font-medium">
                  {montadoras.length} montadoras · {veiculos.length} veículos
                </p>
                <p className="text-xs text-muted-foreground">
                  Edite no{" "}
                  <Link href="/admin/montadoras" className="text-primary hover:underline">
                    painel administrativo
                  </Link>
                </p>
              </div>
            </div>
            <div className="rounded-md border border-dashed p-4 text-sm">
              <p className="font-medium">Pipeline semanal — 7 etapas</p>
              <ol className="mt-2 grid list-decimal gap-1 pl-4 text-xs text-muted-foreground sm:grid-cols-2">
                <li>Scan de feeds e sitemaps</li>
                <li>Fetch respeitando robots.txt</li>
                <li>Classificação heurística</li>
                <li>Deduplicação (SQL + vetorial)</li>
                <li>Extração estruturada (IA)</li>
                <li>Reconciliação de conflitos</li>
                <li>Relatório executivo semanal</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Oportunidades prioritárias</CardTitle>
            <CardDescription>
              Avaliadas pelo laboratório, com evidências rastreáveis.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {OPORTUNIDADES.map((op) => (
              <div
                key={op.slug}
                className="rounded-md border p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium leading-tight">{op.titulo}</span>
                  <Badge
                    variant={
                      op.prioridade === "Alta"
                        ? "destructive"
                        : op.prioridade === "Média"
                          ? "warning"
                          : "secondary"
                    }
                  >
                    {op.prioridade}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {op.evidencias} evidências · {op.pendencias.length} pendências
                </p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/oportunidades">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-highlight" />
              <div>
                <CardTitle>Catálogo recente</CardTitle>
                <CardDescription>
                  Modelos lançados ou atualizados no mercado brasileiro.
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/veiculos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {novidades.length === 0 ? (
              <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
                Nenhum veículo cadastrado. Vá em{" "}
                <Link href="/admin/veiculos" className="font-medium text-primary hover:underline">
                  Admin → Veículos
                </Link>{" "}
                para adicionar.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {novidades.map((v) => (
                  <Link
                    key={v.id}
                    href={`/veiculos/${v.slug}`}
                    className="group block overflow-hidden rounded-lg border bg-card transition-colors hover:border-primary/40"
                  >
                    <FotoVeiculo
                      nome={`${v.marca} ${v.nomeComercial}`}
                      categoria={v.categoria}
                      propulsao={v.propulsao}
                      fotoUrl={v.fotoPrincipalUrl}
                      montadoraSlug={v.montadoraSlug}
                      proporcao="16/9"
                      className="rounded-none ring-0"
                      mostrarAviso={false}
                    />
                    <div className="space-y-2 p-3">
                      <div className="flex items-start gap-2">
                        <LogoMontadora
                          nome={v.marca}
                          slug={v.montadoraSlug}
                          logotipoUrl={v.montadora?.logotipoUrl ?? null}
                          tamanho="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                            {v.marca}
                          </p>
                          <p className="truncate text-sm font-semibold leading-tight group-hover:text-primary">
                            {v.nomeComercial}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px]">
                          {v.situacao}
                        </Badge>
                      </div>
                      {v.resumo ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {v.resumo}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Movimento de mercado</CardTitle>
              <CardDescription>
                Dados fictícios de exemplo — Fenabrave/Anfavea entram na Iteração 8.
              </CardDescription>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AlertaDemo mensagem="Rankings de vendas reais serão importados da Fenabrave e Anfavea na Iteração 8." />
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Emplacamentos</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {VENDAS.map((v) => (
                  <TableRow key={`${v.marca}-${v.modelo}`}>
                    <TableCell>
                      <p className="font-medium">{v.modelo}</p>
                      <p className="text-xs text-muted-foreground">{v.marca}</p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

