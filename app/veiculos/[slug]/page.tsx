import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  MonitorSmartphone,
  Wind,
} from "lucide-react";
import { BotaoSiteOficial } from "@/components/midia/botao-site-oficial";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { GaleriaVeiculo } from "@/components/midia/galeria-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { VideoOficialEmbed } from "@/components/midia/video-oficial-embed";
import { projecoes, MiniEstado } from "@/components/tecnico/conectividade";
import { FonteDado, ListaChecklist } from "@/components/tecnico/elementos";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
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
import { fonteOficialBr } from "@/lib/completude";
import { buscarVeiculoPorSlug } from "@/lib/dados/veiculos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { EstadoConectividade, Palheta, Rastreio } from "@/lib/tipos";
import { formatarData } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await buscarVeiculoPorSlug(slug);
  return { title: r ? `${r.veiculo.marca} ${r.veiculo.nomeComercial}` : "Veículo" };
}

const ORDEM_PALHETA = ["Dianteira (motorista)", "Dianteira (passageiro)", "Traseira"];

export default async function PaginaFichaVeiculo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await buscarVeiculoPorSlug(slug);
  if (!r) notFound();
  const { veiculo, tecnicos } = r;
  const completude = veiculo.completude!;

  // Sem CarPlay/Android Auto identificados o modelo só aparece para o admin.
  if (!completude.publicavel) {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();
  }

  const { ficha, multimidia: mm, iluminacao, palhetas, interruptores } = tecnicos;
  const p = projecoes(mm);
  const palhetasOrdenadas = [...palhetas].sort(
    (a, b) => indice(ORDEM_PALHETA, a.posicao) - indice(ORDEM_PALHETA, b.posicao),
  );
  const fontesPalhetas = Array.from(new Map(palhetas.map((x) => [x.fonteUrl, x as Rastreio])).values());
  const fontesLuz = Array.from(new Map(iluminacao.map((x) => [x.fonteUrl, x as Rastreio])).values());
  const oems = [
    ...iluminacao.filter((i) => i.oem).map((i) => ({ codigo: i.oem!, descricao: `Lâmpada · ${i.posicao}` })),
    ...palhetas.filter((x) => x.oem).map((x) => ({ codigo: x.oem!, descricao: `Palheta · ${x.posicao}` })),
    ...interruptores.filter((i) => i.oem).map((i) => ({ codigo: i.oem!, descricao: `Interruptor · ${i.posicao}` })),
  ];
  const fontes = Array.from(
    new Map(
      [ficha, mm, ...iluminacao, ...palhetas, ...interruptores]
        .filter((d): d is NonNullable<typeof d> => !!d)
        .map((d) => [d.fonteUrl, d.consultadoEm] as const),
    ),
  );
  const pendentes = completude.complementares.filter((i) => !i.ok);

  return (
    <div className="flex flex-col gap-5">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/veiculos">
          <ArrowLeft className="h-4 w-4" />
          Voltar para a lista
        </Link>
      </Button>

      {!completude.publicavel ? (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" />
            Pré-visualização do admin — ainda não aparece no site
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Entra automaticamente quando CarPlay e Android Auto estiverem identificados.
          </p>
        </div>
      ) : null}

      {/* Cabeçalho compacto */}
      <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row sm:items-center">
        <div className="w-full shrink-0 overflow-hidden rounded-lg sm:w-56">
          <FotoVeiculo
            nome={`${veiculo.marca} ${veiculo.nomeComercial}`}
            categoria={veiculo.categoria}
            propulsao={veiculo.propulsao}
            fotoUrl={veiculo.fotoPrincipalUrl ?? null}
            montadoraSlug={veiculo.montadoraSlug}
            proporcao="16/9"
            mostrarAviso={false}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <LogoMontadora nome={veiculo.marca} slug={veiculo.montadoraSlug} logotipoUrl={veiculo.montadora?.logotipoUrl ?? null} tamanho="md" />
            <div className="min-w-0">
              <Link href={`/montadoras/${veiculo.montadoraSlug}`} className="text-xs uppercase tracking-wider text-muted-foreground hover:text-primary">
                {veiculo.marca}
              </Link>
              <h1 className="text-2xl font-bold leading-tight">{veiculo.nomeComercial}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{veiculo.categoria}</Badge>
            <Badge variant="secondary">{veiculo.propulsao}</Badge>
            {veiculo.anoModelo ? <Badge variant="secondary">ano-modelo {veiculo.anoModelo}</Badge> : null}
            {veiculo.situacao !== "Lançado" ? <Badge variant="outline">{veiculo.situacao}</Badge> : null}
          </div>
          {veiculo.resumo ? <p className="text-sm text-muted-foreground">{veiculo.resumo}</p> : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <BotaoSiteOficial url={veiculo.linkOficialUrl} marca={`${veiculo.marca} ${veiculo.nomeComercial}`} texto="Site oficial do modelo" />
          </div>
        </div>
      </section>

      {/* 1. Multimídia — prioridade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MonitorSmartphone className="h-5 w-5 text-primary" />
            Multimídia, CarPlay e Android Auto
          </CardTitle>
          <CardDescription>
            “Sem info” quer dizer que a fonte não especifica — cabo ou sem fio nunca são presumidos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Info rotulo="Tela da central" valor={mm?.telaPolegadas} />
            <Info rotulo="Sistema" valor={mm?.sistema} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <BlocoProjecao titulo="Apple CarPlay" {...p.carplay} />
            <BlocoProjecao titulo="Android Auto" {...p.androidAuto} />
          </div>
          {mm?.observacoes ? <p className="text-sm text-muted-foreground">{mm.observacoes}</p> : null}
          {mm ? <FonteDado dado={mm} /> : null}
        </CardContent>
      </Card>

      {/* 2. Palhetas — prioridade */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wind className="h-5 w-5 text-primary" />
            Palhetas do limpador
          </CardTitle>
          <CardDescription>Medidas por posição, conforme a fonte indicada (com o ano de aplicação).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {ORDEM_PALHETA.map((pos) => {
              const x = palhetasOrdenadas.find((q) => q.posicao === pos);
              return <BlocoPalheta key={pos} posicao={pos} palheta={x} />;
            })}
          </div>
          {palhetasOrdenadas
            .filter((x) => !ORDEM_PALHETA.includes(x.posicao))
            .map((x) => (
              <BlocoPalheta key={x.posicao} posicao={x.posicao} palheta={x} />
            ))}
          {fontesPalhetas.map((d) => (
            <FonteDado key={d.fonteUrl} dado={d} />
          ))}
        </CardContent>
      </Card>

      {/* 3. Lâmpadas */}
      {iluminacao.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
              Faróis e lâmpadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-0 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Tecnologia</TableHead>
                  <TableHead>Lâmpada</TableHead>
                  <TableHead className="hidden sm:table-cell">OEM</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {iluminacao.map((l) => (
                  <TableRow key={l.posicao}>
                    <TableCell className="font-medium">
                      {l.posicao}
                      {l.versoes ? <p className="text-xs font-normal text-muted-foreground">{l.versoes}</p> : null}
                    </TableCell>
                    <TableCell>{l.tecnologia ?? <SemInfo />}</TableCell>
                    <TableCell>{l.codigo ? <Badge variant="secondary">{l.codigo}</Badge> : <SemInfo />}</TableCell>
                    <TableCell className="hidden font-mono text-xs sm:table-cell">{l.oem ?? <SemInfo />}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="space-y-2 px-4">
              {fontesLuz.map((d) => (
                <FonteDado key={d.fonteUrl} dado={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* O que ainda falta */}
      {pendentes.length ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">O que ainda falta neste modelo</CardTitle>
            <CardDescription>Entra na próxima atualização quinzenal assim que houver fonte.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListaChecklist itens={pendentes} className="sm:grid-cols-2" />
          </CardContent>
        </Card>
      ) : null}

      {/* Seções secundárias, recolhidas */}
      <div className="space-y-2">
        <Recolhivel titulo="Ficha mecânica (motor, câmbio, bateria)">
          {ficha ? (
            <div className="space-y-3">
              {ficha.versaoReferencia ? <p className="text-xs text-muted-foreground">Referência: {ficha.versaoReferencia}</p> : null}
              <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                <Linha rotulo="Motor" valor={ficha.motor} />
                <Linha rotulo="Potência" valor={ficha.potencia} />
                <Linha rotulo="Torque" valor={ficha.torque} />
                <Linha rotulo="Câmbio" valor={ficha.cambio} />
                <Linha rotulo="Tração" valor={ficha.tracao} />
                {ficha.bateria ? <Linha rotulo="Bateria" valor={ficha.bateria} /> : null}
                {ficha.autonomia ? <Linha rotulo="Autonomia" valor={ficha.autonomia} /> : null}
              </div>
              <FonteDado dado={ficha} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ainda não coletada.</p>
          )}
        </Recolhivel>

        {interruptores.length || oems.length ? (
          <Recolhivel titulo="Interruptores e códigos OEM">
            <ul className="space-y-1 text-sm">
              {interruptores.map((i) => (
                <li key={i.posicao}>
                  <span className="font-medium">{i.posicao}:</span> {[i.tipo, i.pinos ? `${i.pinos} pinos` : null, i.conector].filter(Boolean).join(" · ") || "sem detalhes"}
                </li>
              ))}
              {oems.map((o) => (
                <li key={`${o.codigo}-${o.descricao}`}>
                  <span className="font-mono text-xs">{o.codigo}</span> — {o.descricao}
                </li>
              ))}
            </ul>
          </Recolhivel>
        ) : null}

        {veiculo.galeriaUrls.length || veiculo.videoOficialUrl ? (
          <Recolhivel titulo="Fotos e vídeo">
            <div className="space-y-4">
              {veiculo.galeriaUrls.length ? (
                <GaleriaVeiculo
                  nome={`${veiculo.marca} ${veiculo.nomeComercial}`}
                  categoria={veiculo.categoria}
                  propulsao={veiculo.propulsao}
                  galeria={veiculo.galeriaUrls}
                  fotoPrincipal={veiculo.fotoPrincipalUrl}
                  montadoraSlug={veiculo.montadoraSlug}
                />
              ) : null}
              {veiculo.videoOficialUrl ? (
                <VideoOficialEmbed url={veiculo.videoOficialUrl} nome={`${veiculo.marca} ${veiculo.nomeComercial}`} />
              ) : null}
            </div>
          </Recolhivel>
        ) : null}

        <Recolhivel titulo={`Fontes consultadas (${fontes.length + (fonteOficialBr(veiculo) ? 1 : 0)})`}>
          <ul className="space-y-2 text-sm">
            {fonteOficialBr(veiculo) ? (
              <ItemFonte url={fonteOficialBr(veiculo)!} rotulo="Venda no Brasil" data={veiculo.verificadoBrEm} />
            ) : null}
            {veiculo.fotoPrincipalFonteUrl ? (
              <ItemFonte url={veiculo.fotoPrincipalFonteUrl} rotulo={`Foto: ${veiculo.fotoPrincipalCredito ?? "crédito na imagem"}`} data={null} />
            ) : null}
            {fontes.map(([url, data]) => (
              <ItemFonte key={url} url={url} rotulo="Dados técnicos" data={data} />
            ))}
          </ul>
        </Recolhivel>
      </div>
    </div>
  );
}

function indice(lista: string[], v: string) {
  const i = lista.indexOf(v);
  return i === -1 ? lista.length : i;
}

function Info({ rotulo, valor }: { rotulo: string; valor: string | null | undefined }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{rotulo}</p>
      <p className="mt-0.5 font-semibold">{valor ?? <SemInfo />}</p>
    </div>
  );
}

function BlocoProjecao({
  titulo,
  geral,
  cabo,
  semFio,
}: {
  titulo: string;
  geral: EstadoConectividade;
  cabo: EstadoConectividade;
  semFio: EstadoConectividade;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{titulo}</p>
        <MiniEstado estado={geral} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded bg-muted/40 p-2">
          <p className="text-xs text-muted-foreground">Por cabo</p>
          <MiniEstado estado={geral === "nao_disponivel" ? "nao_disponivel" : cabo} className="mt-1" />
        </div>
        <div className="rounded bg-muted/40 p-2">
          <p className="text-xs text-muted-foreground">Sem fio</p>
          <MiniEstado estado={geral === "nao_disponivel" ? "nao_disponivel" : semFio} className="mt-1" />
        </div>
      </div>
    </div>
  );
}

function BlocoPalheta({ posicao, palheta }: { posicao: string; palheta?: Palheta }) {
  const medida = palheta
    ? [palheta.medidaPol ? `${palheta.medidaPol}"` : null, palheta.medidaMm ? `${palheta.medidaMm} mm` : null].filter(Boolean).join(" · ")
    : "";
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{posicao}</p>
      <p className="mt-0.5 text-lg font-semibold">{medida || <SemInfo />}</p>
      {palheta?.encaixe ? <p className="text-xs text-muted-foreground">Encaixe: {palheta.encaixe}</p> : null}
      {palheta?.oem ? <p className="font-mono text-xs text-muted-foreground">OEM {palheta.oem}</p> : null}
      {palheta ? <BadgeConfianca nivel={palheta.confianca} /> : null}
    </div>
  );
}

function SemInfo() {
  return <span className="text-sm font-normal text-muted-foreground">sem info</span>;
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium">{valor ?? <SemInfo />}</span>
    </div>
  );
}

function Recolhivel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-lg border bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between p-4 text-sm font-medium">
        {titulo}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t p-4">{children}</div>
    </details>
  );
}

function ItemFonte({ url, rotulo, data }: { url: string; rotulo: string; data: string | null }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">{rotulo}</span>
      <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all font-medium text-primary hover:underline">
        {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 70)}
        <ExternalLink className="h-3 w-3 shrink-0" />
        {data ? <span className="ml-1 font-normal text-muted-foreground">· {formatarData(data)}</span> : null}
      </a>
    </li>
  );
}
