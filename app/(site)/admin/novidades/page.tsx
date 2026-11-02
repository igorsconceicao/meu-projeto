import Link from "next/link";
import { CheckCircle2, ExternalLink, PlusCircle, Radar, TriangleAlert } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { BotoesNovidade } from "@/components/admin/botoes-novidade";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { linksForaDoCatalogo } from "@/lib/monitor";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novidades detectadas" };

type Novidade = {
  id: string;
  tipo: "link_novo" | "link_removido" | "pagina_fora_do_ar";
  titulo: string;
  url: string;
  fonte_url: string | null;
  status: "pendente" | "resolvido" | "ignorado";
  detectado_em: string;
  veiculo_id: string | null;
  montadoras: { nome: string; slug: string } | null;
};

type Fonte = {
  id: string;
  montadora_id: string | null;
  url: string;
  ativo: boolean;
  snapshot: { url: string; texto: string }[] | null;
  verificado_em: string | null;
  status_http: number | null;
  erro: string | null;
  montadoras: { nome: string } | null;
};

const TIPOS: Record<Novidade["tipo"], { rotulo: string; explica: string }> = {
  link_novo: {
    rotulo: "Link novo",
    explica: "Apareceu uma página de modelo que não estava na leitura anterior e não está no catálogo.",
  },
  link_removido: {
    rotulo: "Saiu do site",
    explica: "Um modelo do catálogo deixou de aparecer na página da marca (pode ter sido descontinuado).",
  },
  pagina_fora_do_ar: {
    rotulo: "Página fora do ar",
    explica: "A página oficial cadastrada para o modelo respondeu “não encontrada”.",
  },
};

function data(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—";
}

export default async function PaginaNovidades({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { ver } = await searchParams;
  const supabase = await criarClienteSupabaseServidor();
  const [{ data: novidades, error: e1 }, { data: fontes, error: e2 }, veiculos] = await Promise.all([
    supabase
      .from("monitor_novidades")
      .select("id, tipo, titulo, url, fonte_url, status, detectado_em, veiculo_id, montadoras(nome, slug)")
      .order("detectado_em", { ascending: false })
      .limit(300),
    supabase
      .from("monitor_fontes")
      .select("id, montadora_id, url, ativo, snapshot, verificado_em, status_http, erro, montadoras(nome)")
      .eq("ativo", true)
      .order("url"),
    buscarVeiculos(),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;

  const todas = (novidades ?? []) as unknown as Novidade[];
  const pendentes = todas.filter((n) => n.status === "pendente");
  const lista = ver === "todas" ? todas : pendentes;
  const listaFontes = (fontes ?? []) as unknown as Fonte[];
  const lidas = listaFontes.filter((f) => f.snapshot?.length);
  const ultima = listaFontes.map((f) => f.verificado_em).filter(Boolean).sort().at(-1) ?? null;
  const cobertura = lidas
    .map((f) => ({
      fonte: f,
      fora: linksForaDoCatalogo(f.snapshot ?? [], { url: f.url, montadoraId: f.montadora_id }, veiculos),
    }))
    .filter((c) => c.fora.length > 0)
    .sort((a, b) => b.fora.length - a.fora.length);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Novidades detectadas"
        descricao="Toda segunda-feira o sistema lê o site oficial de cada marca, compara a lista de modelos com a semana anterior e confere se as páginas oficiais do catálogo continuam no ar. O que mudou aparece aqui para você revisar — nada entra no site sozinho."
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador titulo="Para revisar" valor={String(pendentes.length)} destaque={pendentes.length > 0} />
        <Indicador titulo="Sites lidos com sucesso" valor={`${lidas.length} de ${listaFontes.length}`} />
        <Indicador titulo="Última verificação" valor={data(ultima)} />
        <Indicador titulo="Próxima verificação" valor="segunda-feira" />
      </section>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-primary" />
              {ver === "todas" ? "Todas as novidades" : "Pendentes"}
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ver === "todas" ? "/admin/novidades" : "/admin/novidades?ver=todas"}>
                {ver === "todas" ? "Só pendentes" : "Ver histórico completo"}
              </Link>
            </Button>
          </div>
          <CardDescription>
            Ao cadastrar um modelo novo, use o link detectado como fonte e marque como “Resolvido”. Links que não são modelos
            (campanhas, páginas institucionais) podem ser ignorados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {lista.length === 0 ? (
            <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-success" />
              {todas.length === 0
                ? "Nenhuma mudança detectada ainda. A primeira leitura registra a lista atual de cada site; as novidades aparecem a partir da semana seguinte."
                : "Nada pendente. Tudo revisado."}
            </p>
          ) : (
            lista.map((n) => (
              <div key={n.id} className={cn("flex flex-col gap-2 rounded-md border p-3 md:flex-row md:items-center md:justify-between", n.status !== "pendente" && "opacity-60")}>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant={n.tipo === "link_novo" ? "default" : "warning"} title={TIPOS[n.tipo].explica}>
                      {TIPOS[n.tipo].rotulo}
                    </Badge>
                    {n.montadoras ? <span className="text-muted-foreground">{n.montadoras.nome}</span> : null}
                    <span className="font-medium">{n.titulo}</span>
                    {n.status !== "pendente" ? <Badge variant="outline">{n.status}</Badge> : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                      {n.url} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    <span>detectado em {data(n.detectado_em)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {n.tipo === "link_novo" && n.status === "pendente" ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href="/admin/veiculos/novo">
                        <PlusCircle className="h-4 w-4" />
                        Cadastrar
                      </Link>
                    </Button>
                  ) : null}
                  {n.veiculo_id ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/veiculos/${n.veiculo_id}`}>Abrir modelo</Link>
                    </Button>
                  ) : null}
                  <BotoesNovidade id={n.id} status={n.status} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Na página da marca, ainda fora do catálogo</CardTitle>
          <CardDescription>
            Páginas de modelo que o site oficial mostra hoje e que não correspondem a nenhum veículo cadastrado. É a lista de
            trabalho para completar o catálogo. Pode incluir páginas de versão ou de comerciais — confira antes de cadastrar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {cobertura.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todos os modelos das páginas lidas já estão no catálogo.</p>
          ) : (
            cobertura.map(({ fonte, fora }) => (
              <details key={fonte.id} className="group rounded-md border p-3">
                <summary className="cursor-pointer list-none text-sm font-medium">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                  {fonte.montadoras?.nome ?? fonte.url}
                  <Badge variant="secondary" className="ml-2">{fora.length}</Badge>
                </summary>
                <ul className="mt-2 space-y-1 text-xs">
                  {fora.map((l) => (
                    <li key={l.url} className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{l.texto || "(sem título)"}</span>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                        {l.url.replace(/^https?:\/\/(www\.)?/, "")} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sites monitorados</CardTitle>
          <CardDescription>
            Alguns sites bloqueiam leitura automática (erro 403) ou montam a lista de modelos só no navegador. Nesses casos a
            verificação é feita nas rodadas manuais de pesquisa.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Página lida</TableHead>
                <TableHead className="text-right">Modelos na página</TableHead>
                <TableHead>Situação</TableHead>
                <TableHead>Lido em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listaFontes.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">{f.montadoras?.nome ?? "—"}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-xs">
                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {f.url.replace(/^https?:\/\/(www\.)?/, "")}
                    </a>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{f.snapshot?.length ?? 0}</TableCell>
                  <TableCell className="text-xs">
                    {!f.verificado_em ? (
                      <span className="text-muted-foreground">Aguardando primeira leitura</span>
                    ) : f.snapshot?.length && !f.erro ? (
                      <span className="inline-flex items-center gap-1 text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Monitorando
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <TriangleAlert className="h-3.5 w-3.5 text-highlight" />
                        {f.status_http === 403 ? "Site bloqueia leitura automática" : (f.erro ?? "Sem leitura")}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{data(f.verificado_em)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function Indicador({ titulo, valor, destaque }: { titulo: string; valor: string; destaque?: boolean }) {
  return (
    <Card className={cn(destaque && "border-highlight/60")}>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="mt-1 truncate text-lg font-semibold tabular-nums">{valor}</p>
      </CardContent>
    </Card>
  );
}
