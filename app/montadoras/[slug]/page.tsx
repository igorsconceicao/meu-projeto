import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleDashed, Globe2 } from "lucide-react";
import { BotaoSiteOficial } from "@/components/midia/botao-site-oficial";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { ResumoTecnicoCard } from "@/components/tecnico/resumo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { projecaoSemFio, tipoFarol } from "@/lib/classificacao";
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = (await buscarMontadoras()).find((x) => x.slug === slug);
  return { title: m ? m.nome : "Montadora" };
}

export default async function PaginaMontadora({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [montadoras, veiculos] = await Promise.all([buscarMontadoras(), buscarVeiculos()]);
  const m = montadoras.find((x) => x.slug === slug);
  if (!m) notFound();

  const daMarca = veiculos.filter((v) => v.montadoraId === m.id);
  const publicados = daMarca.filter((v) => v.completude?.publicavel);
  const emVerificacao = daMarca.filter((v) => !v.completude?.publicavel);

  // Resumo de conectividade da marca (só publicados)
  const semFio = publicados.filter((v) => projecaoSemFio(v) !== "nenhuma").length;
  const farolLed = publicados.filter((v) => tipoFarol(v) === "led").length;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" className="self-start" asChild>
        <Link href="/montadoras">
          <ArrowLeft className="h-4 w-4" />
          Todas as montadoras
        </Link>
      </Button>

      <section className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center">
        <LogoMontadora nome={m.nome} slug={m.slug} logotipoUrl={m.logotipoUrl} logotipoCredito={m.logotipoCredito} tamanho="lg" />
        <div className="flex-1 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{m.nome}</h1>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {m.grupo ? <span>{m.grupo}</span> : null}
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-3.5 w-3.5" />
              Origem: {m.pais}
            </span>
          </p>
          {m.destaque ? <p className="text-sm">{m.destaque}</p> : null}
        </div>
        <BotaoSiteOficial url={m.siteOficialUrl} marca={m.nome} texto="Site oficial no Brasil" variant="outline" />
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador titulo="Modelos publicados" valor={publicados.length} ajuda="Com o pacote mínimo de dados confirmado" />
        <Indicador titulo="Em verificação" valor={emVerificacao.length} ajuda="Cadastrados, aguardando dados obrigatórios" />
        <Indicador titulo="CarPlay/AA sem fio" valor={semFio} ajuda="Publicados com projeção sem fio (todas ou algumas versões)" />
        <Indicador titulo="Faróis em LED" valor={farolLed} ajuda="Publicados com farol principal LED em pelo menos uma versão" />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Modelos publicados</h2>
        {publicados.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {publicados.map((v) => (
              <Link key={v.id} href={`/veiculos/${v.slug}`} className="group overflow-hidden rounded-lg border bg-card hover:border-primary/40">
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
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold group-hover:text-primary">{v.nomeComercial}</p>
                    <Badge variant="outline" className="shrink-0 text-[10px]">{v.situacao}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">{v.categoria}</Badge>
                    <Badge variant="secondary">{v.propulsao}</Badge>
                  </div>
                  <ResumoTecnicoCard tecnicos={v.tecnicos} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Nenhum modelo desta marca tem ainda o pacote mínimo de dados confirmado em fonte oficial.
          </p>
        )}
      </section>

      {emVerificacao.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Em verificação</CardTitle>
            <CardDescription>
              Modelos vendidos no Brasil que ainda não aparecem no catálogo porque falta confirmar algum dado obrigatório em fonte oficial.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {emVerificacao.map((v) => (
                <li key={v.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium">{v.nomeComercial}</span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CircleDashed className="h-3.5 w-3.5 text-warning" />
                    Falta:{" "}
                    {v.completude?.obrigatorios
                      .filter((i) => !i.ok)
                      .map((i) => i.rotulo.toLowerCase())
                      .join(", ")}
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

function Indicador({ titulo, valor, ajuda }: { titulo: string; valor: number; ajuda: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{titulo}</p>
        <p className="mt-1 text-2xl font-semibold">{valor}</p>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{ajuda}</p>
      </CardContent>
    </Card>
  );
}
