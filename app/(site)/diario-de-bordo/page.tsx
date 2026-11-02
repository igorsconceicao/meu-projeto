import { AlertTriangle, CheckCircle2, Globe, Radar, Search, Sparkles } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buscarAtividade, buscarDiario, type EntradaDiario } from "@/lib/dados/diario";
import { formatarData, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Diário de Bordo" };

const TIPO: Record<EntradaDiario["tipo"], string> = {
  rotina: "Rotina automática",
  monitoramento: "Varredura dos sites",
  vendas: "Vendas",
  pesquisa: "Rodada de pesquisa",
  manual: "Registro manual",
};

const AREA: Record<string, string> = {
  modelos_novos: "Modelos novos",
  multimidia: "CarPlay / multimídia",
  palhetas: "Palhetas",
  versoes: "Versões",
  fichas: "Fichas técnicas",
  iluminacao: "Iluminação",
  interruptores: "Interruptores de vidro",
  novidades_detectadas: "Novidades nos sites",
  vendas: "Linhas de vendas",
};

function quando(iso: string) {
  const d = new Date(iso);
  return `${formatarData(d)} às ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}`;
}

function valor(v: number | string) {
  return typeof v === "number" ? formatarNumero(v) : v;
}

export default async function PaginaDiarioBordo() {
  const [entradas, atividade] = await Promise.all([buscarDiario(), buscarAtividade()]);
  const [ultima, ...anteriores] = entradas;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Diário de Bordo"
        descricao="Como o computador de bordo de um carro, aqui fica registrada cada viagem da atualização automática: o que ela foi buscar no mercado, o que encontrou de novo, os números e o que ficou pendente."
      />

      {ultima ? (
        <Card className="border-primary/40">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Última atualização</Badge>
              <Badge variant="outline">{TIPO[ultima.tipo]}</Badge>
              <span className="text-xs text-muted-foreground">{quando(ultima.realizadoEm)}</span>
            </div>
            <CardTitle className="text-xl">{ultima.titulo}</CardTitle>
            <CardDescription className="text-base text-foreground/80">{ultima.resumo}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Numeros entrada={ultima} grande />
            <Detalhes entrada={ultima} />
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma atualização registrada ainda.
        </div>
      )}

      {anteriores.length ? (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Viagens anteriores</h2>
          <ol className="relative space-y-4 border-l pl-5">
            {anteriores.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[27px] top-5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                <details className="group rounded-lg border bg-card">
                  <summary className="cursor-pointer list-none p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{TIPO[e.tipo]}</Badge>
                      <span className="text-xs text-muted-foreground">{quando(e.realizadoEm)}</span>
                      <span className="ml-auto text-xs text-primary group-open:hidden">ver detalhes</span>
                    </div>
                    <p className="mt-1 font-semibold">{e.titulo}</p>
                    <p className="text-sm text-muted-foreground">{e.resumo}</p>
                    <div className="mt-3">
                      <Numeros entrada={e} />
                    </div>
                  </summary>
                  <div className="border-t p-4">
                    <Detalhes entrada={e} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {atividade.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Radar className="h-4 w-4 text-primary" /> Hodômetro do banco de dados
            </CardTitle>
            <CardDescription>
              Contagem automática do que foi gravado ou atualizado em cada dia nos últimos 45 dias, direto do banco — mesmo quando
              não há texto no diário.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y">
              {atividade.map((d) => (
                <li key={d.dia} className="grid gap-2 px-5 py-3 md:grid-cols-[140px_1fr] md:items-center">
                  <span className="text-sm font-medium">{formatarData(d.dia)}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {Object.entries(d.areas)
                      .sort((a, b) => b[1] - a[1])
                      .map(([area, n]) => (
                        <Badge key={area} variant="secondary" className="font-normal">
                          {AREA[area] ?? area}: <span className="ml-1 font-semibold tabular-nums">{formatarNumero(n)}</span>
                        </Badge>
                      ))}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Numeros({ entrada, grande }: { entrada: EntradaDiario; grande?: boolean }) {
  if (!entrada.numeros.length) return null;
  return (
    <div className={`grid gap-3 ${grande ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-4"}`}>
      {entrada.numeros.map((n) => (
        <div key={n.rotulo} className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">{n.rotulo}</p>
          <p className={`${grande ? "text-2xl" : "text-lg"} font-semibold tabular-nums`}>{valor(n.valor)}</p>
          {n.detalhe ? <p className="text-[11px] text-muted-foreground">{n.detalhe}</p> : null}
        </div>
      ))}
    </div>
  );
}

function Lista({ titulo, itens, Icone, cor }: { titulo: string; itens: string[]; Icone: typeof Search; cor: string }) {
  if (!itens.length) return null;
  return (
    <div>
      <p className={`mb-1.5 flex items-center gap-1.5 text-sm font-semibold ${cor}`}>
        <Icone className="h-4 w-4" /> {titulo}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function Detalhes({ entrada }: { entrada: EntradaDiario }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <Lista titulo="O que foi buscar" itens={entrada.buscou} Icone={Search} cor="text-foreground" />
      <Lista titulo="O que encontrou de novo" itens={entrada.encontrou} Icone={Sparkles} cor="text-success" />
      <Lista titulo="Ficou pendente" itens={entrada.pendencias} Icone={AlertTriangle} cor="text-warning" />
      {entrada.fontes.length ? (
        <div className="md:col-span-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Globe className="h-3.5 w-3.5" /> Fontes consultadas
          </p>
          <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {entrada.fontes.slice(0, 30).map((f) => (
              <a key={f} href={f} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {(() => {
                  try {
                    const u = new URL(f);
                    return u.host.replace(/^www\./, "") + (u.pathname.length > 1 ? u.pathname.slice(0, 40) : "");
                  } catch {
                    return f;
                  }
                })()}
              </a>
            ))}
          </p>
        </div>
      ) : null}
      {!entrada.buscou.length && !entrada.encontrou.length && !entrada.pendencias.length ? (
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" /> Sem detalhes adicionais.
        </p>
      ) : null}
    </div>
  );
}
