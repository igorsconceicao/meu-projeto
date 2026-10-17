import Link from "next/link";
import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
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
import { buscarEmplacamentos } from "@/lib/dados/emplacamentos";
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import {
  movimentos,
  participacaoPorOrigem,
  tecnologiaPorOrigem,
  variacaoPorMarca,
  type Movimento,
} from "@/lib/tendencias";
import { cn, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tendências do mercado" };

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mes = (p: string | null) => (p ? `${MESES[Number(p.slice(5, 7)) - 1]}/${p.slice(2, 4)}` : "—");
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "—");

// Cores fixas por origem (as demais usam a cor neutra).
const COR_ORIGEM: Record<string, string> = {
  China: "bg-highlight",
  Itália: "bg-primary",
  Alemanha: "bg-sky-500",
  "Estados Unidos": "bg-indigo-500",
  Japão: "bg-rose-500",
  França: "bg-teal-500",
  "Coreia do Sul": "bg-amber-500",
};

export default async function PaginaTendencias() {
  const [emplacamentos, montadoras, veiculos] = await Promise.all([
    buscarEmplacamentos(),
    buscarMontadoras(),
    buscarVeiculos(),
  ]);

  if (emplacamentos.length === 0) {
    return (
      <EmConstrucao
        titulo="Tendências do mercado"
        descricao="Movimentos de vendas e de tecnologia calculados com dados oficiais."
        vaiMostrar={["Quem sobe e quem cai no ranking", "Participação por origem da marca", "Tecnologia embarcada por origem"]}
        fontes={["Fenabrave — Informativo mensal de emplacamentos", "Catálogo técnico (fontes oficiais)"]}
      />
    );
  }

  const mov = movimentos(emplacamentos);
  const origem = participacaoPorOrigem(emplacamentos, montadoras);
  const marcas = variacaoPorMarca(emplacamentos);
  const tec = tecnologiaPorOrigem(veiculos, montadoras);
  const ultimaLinha = origem.linhas.at(-1);
  const primeiraLinha = origem.linhas[0];
  const china = (l: typeof ultimaLinha) => (l ? (l.porPais.get("China") ?? 0) / (l.total || 1) : 0);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Tendências do mercado"
        descricao={`Movimentos calculados com o ranking oficial da Fenabrave (${mes(origem.meses[0])} a ${mes(origem.meses.at(-1) ?? null)}) e com as fichas técnicas publicadas no catálogo. As somas consideram os 50 modelos mais emplacados de automóveis e de comerciais leves de cada mês — não o mercado total.`}
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador
          titulo={`Marcas chinesas no top 50 (${mes(origem.meses.at(-1) ?? null)})`}
          valor={`${Math.round(china(ultimaLinha) * 100)}%`}
          detalhe={primeiraLinha && primeiraLinha !== ultimaLinha ? `${Math.round(china(primeiraLinha) * 100)}% em ${mes(primeiraLinha.mes)}` : undefined}
        />
        <Indicador titulo="Maior subida no ranking" valor={mov.subiram[0]?.nome ?? "—"} detalhe={mov.subiram[0] ? `${mov.subiram[0].anterior}º → ${mov.subiram[0].posicao}º` : undefined} />
        <Indicador titulo={`Novos no top 50 em ${mes(mov.agora)}`} valor={String(mov.entraram.length)} detalhe="automóveis + comerciais" />
        <Indicador
          titulo="Catálogo com CarPlay/AA sem fio"
          valor={pct(tec.total.semFio, tec.total.modelos)}
          detalhe={`${tec.total.semFio} de ${tec.total.modelos} modelos publicados`}
        />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ListaMovimento titulo={`Quem mais subiu (${mes(mov.antes)} → ${mes(mov.agora)})`} itens={mov.subiram} sentido="sobe" />
        <ListaMovimento titulo={`Quem mais caiu (${mes(mov.antes)} → ${mes(mov.agora)})`} itens={mov.cairam} sentido="cai" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participação por origem da marca</CardTitle>
          <CardDescription>
            Unidades dos 50 mais emplacados (automóveis + comerciais leves) por país de origem da marca. Passe o mouse para ver os números.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {origem.linhas.map((l) => (
            <div key={l.mes} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-xs text-muted-foreground">{mes(l.mes)}</span>
              <div className="flex h-6 flex-1 overflow-hidden rounded-md bg-muted">
                {origem.paises.map((p) => {
                  const u = l.porPais.get(p) ?? 0;
                  if (!u) return null;
                  return (
                    <span
                      key={p}
                      className={cn("h-full", COR_ORIGEM[p] ?? "bg-muted-foreground/40")}
                      style={{ width: `${(u / l.total) * 100}%` }}
                      title={`${p}: ${formatarNumero(u)} unidades (${pct(u, l.total)})`}
                    />
                  );
                })}
              </div>
              <span className="w-20 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{formatarNumero(l.total)}</span>
            </div>
          ))}
          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-xs">
            {origem.paises.map((p) => (
              <span key={p} className="inline-flex items-center gap-1.5">
                <span className={cn("h-2.5 w-2.5 rounded-sm", COR_ORIGEM[p] ?? "bg-muted-foreground/40")} />
                {p}
                {ultimaLinha ? <span className="text-muted-foreground">{pct(ultimaLinha.porPais.get(p) ?? 0, ultimaLinha.total)}</span> : null}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Marcas: variação no mês</CardTitle>
            <CardDescription>
              Soma dos modelos de cada marca no top 50, {mes(mov.antes)} → {mes(mov.agora)} (marcas com pelo menos 1.000 unidades no mês anterior).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead className="text-right">{mes(mov.antes)}</TableHead>
                  <TableHead className="text-right">{mes(mov.agora)}</TableHead>
                  <TableHead className="text-right">Variação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marcas.map((m) => (
                  <TableRow key={m.marca}>
                    <TableCell className="font-medium">{m.marca}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{formatarNumero(m.anterior ?? 0)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatarNumero(m.unidades)}</TableCell>
                    <TableCell className={cn("text-right tabular-nums", (m.variacao ?? 0) >= 0 ? "text-success" : "text-destructive")}>
                      {m.variacao === null ? "—" : `${m.variacao >= 0 ? "+" : ""}${Math.round(m.variacao * 100)}%`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tecnologia embarcada por origem da marca</CardTitle>
            <CardDescription>
              Modelos publicados no catálogo. “Sem fio” = CarPlay ou Android Auto sem fio confirmado em todas ou em algumas versões.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Origem</TableHead>
                  <TableHead className="text-right">Modelos</TableHead>
                  <TableHead className="text-right">Sem fio</TableHead>
                  <TableHead className="text-right">Farol LED</TableHead>
                  <TableHead className="text-right">Tela ≥ 12&quot;</TableHead>
                  <TableHead className="text-right">Eletrificados</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...tec.linhas, tec.total].map((l) => (
                  <TableRow key={l.origem} className={l.origem === "Todos" ? "font-medium" : undefined}>
                    <TableCell>{l.origem}</TableCell>
                    <TableCell className="text-right tabular-nums">{l.modelos}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(l.semFio, l.modelos)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(l.led, l.modelos)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(l.telaGrande, l.modelos)}</TableCell>
                    <TableCell className="text-right tabular-nums">{pct(l.eletrificados, l.modelos)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {mov.entraram.length || mov.sairam.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-highlight" />
              Entraram e saíram do top 50 em {mes(mov.agora)}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Entraram</p>
              <ul className="space-y-1">
                {mov.entraram.map((m) => (
                  <li key={`${m.segmento}${m.nome}`} className="flex justify-between gap-2">
                    <span>
                      {m.nome} <span className="text-xs text-muted-foreground">({m.segmento.toLowerCase()})</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">{m.posicao}º · {formatarNumero(m.unidades)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Saíram</p>
              <ul className="space-y-1">
                {mov.sairam.map((m) => (
                  <li key={`${m.segmento}${m.nome}`} className="flex justify-between gap-2">
                    <span>
                      {m.nome} <span className="text-xs text-muted-foreground">({m.segmento.toLowerCase()})</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">era {m.posicao}º</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Fontes: Fenabrave (informativo mensal de emplacamentos, atualizado automaticamente todo mês) e fichas do{" "}
        <Link href="/veiculos" className="text-primary hover:underline">catálogo técnico</Link>. Opiniões de consumidores e acessórios em alta
        dependem de fontes externas ainda não conectadas.
      </p>
    </div>
  );
}

function Indicador({ titulo, valor, detalhe }: { titulo: string; valor: string; detalhe?: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="mt-1 truncate text-lg font-semibold tabular-nums">{valor}</p>
        {detalhe ? <p className="truncate text-xs text-muted-foreground">{detalhe}</p> : null}
      </CardContent>
    </Card>
  );
}

function ListaMovimento({ titulo, itens, sentido }: { titulo: string; itens: Movimento[]; sentido: "sobe" | "cai" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem movimentos neste período.</p>
        ) : (
          <ul className="divide-y text-sm">
            {itens.map((m) => {
              const d = Math.abs((m.anterior ?? m.posicao) - m.posicao);
              return (
                <li key={`${m.segmento}${m.nome}`} className="flex items-center justify-between gap-2 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{m.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.segmento} · {m.anterior}º → {m.posicao}º · {formatarNumero(m.unidades)} un.
                    </p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 gap-0.5", sentido === "sobe" ? "text-success" : "text-destructive")}>
                    {sentido === "sobe" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {d}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
