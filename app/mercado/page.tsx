import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Minus } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { EmConstrucao } from "@/components/layout/em-construcao";
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
import { farolPorVersao, projecaoSemFio } from "@/lib/classificacao";
import { buscarEmplacamentos, ligarAoCatalogo, type Emplacamento } from "@/lib/dados/emplacamentos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { cn, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mercado e vendas" };

const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function nomeMes(periodo: string) {
  const [ano, mes] = periodo.split("-").map(Number);
  return `${MESES[mes - 1]}/${ano}`;
}

type Filtros = { segmento?: string; visao?: string; periodo?: string };

export default async function PaginaMercado({ searchParams }: { searchParams: Promise<Filtros> }) {
  const f = await searchParams;
  const [emplacamentos, veiculos] = await Promise.all([buscarEmplacamentos(), buscarVeiculos()]);

  if (emplacamentos.length === 0) {
    return (
      <EmConstrucao
        titulo="Mercado e vendas"
        descricao="Ranking dos emplacamentos no Brasil por modelo."
        vaiMostrar={["Ranking mensal e acumulado de automóveis e comerciais leves"]}
        fontes={["Fenabrave — Informativo mensal de emplacamentos"]}
      />
    );
  }

  const segmento: Emplacamento["segmento"] = f.segmento === "comerciais" ? "Comerciais leves" : "Automóveis";
  const visao: Emplacamento["tipo"] = f.visao === "acumulado" ? "acumulado" : "mensal";
  const periodos = [...new Set(emplacamentos.map((e) => e.periodo))].sort().reverse();
  const periodo = periodos.includes(f.periodo ?? "") ? f.periodo! : periodos[0];
  const anterior = periodos[periodos.indexOf(periodo) + 1];

  const lista = ligarAoCatalogo(
    emplacamentos.filter((e) => e.periodo === periodo && e.tipo === visao && e.segmento === segmento),
    veiculos,
  );
  const posAnterior = new Map(
    emplacamentos
      .filter((e) => e.periodo === anterior && e.tipo === "mensal" && e.segmento === segmento)
      .map((e) => [`${e.marca}/${e.modelo}`, e]),
  );
  const maior = lista[0]?.unidades ?? 1;
  const total = lista.reduce((s, e) => s + e.unidades, 0);
  const noCatalogo = lista.filter((e) => e.veiculo).length;
  const fonte = lista[0]?.fonteUrl;
  const edicao = lista[0]?.edicao;

  const link = (mudar: Partial<Filtros>) => {
    const p = new URLSearchParams();
    const alvo = { segmento: f.segmento, visao: f.visao, periodo: f.periodo, ...mudar };
    for (const [k, v] of Object.entries(alvo)) if (v) p.set(k, v);
    return `/mercado${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Mercado e vendas"
        descricao={`Os 50 modelos mais emplacados no Brasil, conforme o informativo oficial da Fenabrave${edicao ? ` (edição ${edicao})` : ""}. Clique num modelo do catálogo para ver a ficha técnica e cruzar vendas com conectividade e faróis.`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Alternar ativo={segmento === "Automóveis"} href={link({ segmento: undefined })}>Automóveis</Alternar>
        <Alternar ativo={segmento === "Comerciais leves"} href={link({ segmento: "comerciais" })}>Comerciais leves</Alternar>
        <span className="mx-1 h-5 w-px bg-border" />
        <Alternar ativo={visao === "mensal"} href={link({ visao: undefined })}>No mês</Alternar>
        <Alternar ativo={visao === "acumulado"} href={link({ visao: "acumulado" })}>Acumulado do ano</Alternar>
        <span className="mx-1 h-5 w-px bg-border" />
        {periodos.map((p) => (
          <Alternar key={p} ativo={p === periodo} href={link({ periodo: p === periodos[0] ? undefined : p })}>
            {nomeMes(p)}
          </Alternar>
        ))}
      </div>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador titulo={visao === "mensal" ? `Líder em ${nomeMes(periodo)}` : `Líder no ano até ${nomeMes(periodo)}`} valor={lista[0] ? `${lista[0].marca}/${lista[0].modelo}` : "—"} />
        <Indicador titulo="Unidades do líder" valor={lista[0] ? formatarNumero(lista[0].unidades) : "—"} />
        <Indicador titulo={`Soma dos ${lista.length} primeiros`} valor={formatarNumero(total)} />
        <Indicador titulo="Desses, no catálogo técnico" valor={`${noCatalogo} de ${lista.length}`} />
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {segmento} · {visao === "mensal" ? nomeMes(periodo) : `acumulado até ${nomeMes(periodo)}`}
          </CardTitle>
          <CardDescription>
            {visao === "mensal" && anterior ? `Setas: posição em relação a ${nomeMes(anterior)}. ` : ""}
            Colunas de conectividade e farol só aparecem para modelos já publicados no catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-right">#</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead className="text-right">Unidades</TableHead>
                <TableHead className="hidden w-1/4 md:table-cell">Volume</TableHead>
                <TableHead className="hidden lg:table-cell">CarPlay/AA sem fio</TableHead>
                <TableHead className="hidden lg:table-cell">Farol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((e) => {
                const ant = visao === "mensal" ? posAnterior.get(`${e.marca}/${e.modelo}`) : undefined;
                const publicado = e.veiculo?.completude?.publicavel;
                const semFio = publicado ? projecaoSemFio(e.veiculo!) : null;
                const farol = publicado ? farolPorVersao(e.veiculo!) : null;
                return (
                  <TableRow key={e.posicao}>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{e.posicao}º</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {ant ? <Variacao atual={e.posicao} anterior={ant.posicao} /> : visao === "mensal" && anterior ? <Badge variant="outline" className="text-[10px]">novo</Badge> : null}
                        {publicado ? (
                          <Link href={`/veiculos/${e.veiculo!.slug}`} className="font-medium hover:text-primary">
                            {e.marca}/{e.modelo}
                          </Link>
                        ) : e.montadoraSlug ? (
                          <Link href={`/montadoras/${e.montadoraSlug}`} className="font-medium hover:text-primary">
                            {e.marca}/{e.modelo}
                          </Link>
                        ) : (
                          <span className="font-medium">{e.marca}/{e.modelo}</span>
                        )}
                        {e.ligacao === "familia" ? (
                          <span className="text-[11px] text-muted-foreground" title="A Fenabrave soma todas as versões do modelo">
                            → {e.veiculo!.nomeComercial}
                          </span>
                        ) : null}
                        {e.veiculo && !publicado ? (
                          <Badge variant="secondary" className="text-[10px]">em verificação</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatarNumero(e.unidades)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="block h-2 overflow-hidden rounded-full bg-muted" title={`${formatarNumero(e.unidades)} unidades`}>
                        <span className="block h-full rounded-full bg-primary" style={{ width: `${(e.unidades / maior) * 100}%` }} />
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {semFio === null ? <span className="text-muted-foreground">—</span> : semFio === "todas" ? "Sim" : semFio === "algumas" ? "Algumas versões" : "Não confirmado"}
                    </TableCell>
                    <TableCell className="hidden text-sm lg:table-cell">
                      {farol === null ? <span className="text-muted-foreground">—</span> : farol === "led" ? "LED" : farol === "misto" ? "Halógeno / LED" : farol === "halogeno" ? "Halógeno" : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {fonte ? (
        <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          Fonte: Fenabrave — Informativo de emplacamentos{edicao ? `, edição ${edicao}` : ""}.
          <a href={fonte} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
            Abrir o PDF oficial <ExternalLink className="h-3 w-3" />
          </a>
          Atualizado automaticamente todo mês.
        </p>
      ) : null}
    </div>
  );
}

function Alternar({ ativo, href, children }: { ativo: boolean; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        ativo ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent",
      )}
    >
      {children}
    </Link>
  );
}

function Indicador({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="mt-1 truncate text-lg font-semibold tabular-nums">{valor}</p>
      </CardContent>
    </Card>
  );
}

function Variacao({ atual, anterior }: { atual: number; anterior: number }) {
  const d = anterior - atual;
  if (d === 0) return <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-label="mesma posição" />;
  return d > 0 ? (
    <span className="inline-flex items-center text-[11px] text-success" title={`Subiu ${d} posições`}>
      <ArrowUp className="h-3.5 w-3.5" />
      {d}
    </span>
  ) : (
    <span className="inline-flex items-center text-[11px] text-destructive" title={`Caiu ${-d} posições`}>
      <ArrowDown className="h-3.5 w-3.5" />
      {-d}
    </span>
  );
}
