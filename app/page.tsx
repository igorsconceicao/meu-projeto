import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Car,
  CheckCircle2,
  CircleDashed,
  Lightbulb,
  MonitorSmartphone,
  Search,
  Wifi,
} from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { projecaoSemFio as conexao, tipoFarol as farol } from "@/lib/classificacao";
import { formatarData, formatarNumero } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ITENS_MINIMOS = [
  "Foto real da versão vendida no Brasil",
  "Página oficial brasileira da montadora (site ou sala de imprensa)",
  "Motor e câmbio (ou bateria/autonomia nos elétricos)",
  "Tamanho da tela da central multimídia",
  "CarPlay e Android Auto confirmados",
  "Tecnologia dos faróis",
];

export default async function PaginaDashboard() {
  const [montadoras, todos] = await Promise.all([buscarMontadoras(), buscarVeiculos()]);
  const publicados = todos.filter((v) => v.completude?.publicavel);
  const emVerificacao = todos.length - publicados.length;
  const total = publicados.length || 1;

  const porConexao = {
    todas: publicados.filter((v) => conexao(v) === "todas").length,
    algumas: publicados.filter((v) => conexao(v) === "algumas").length,
    nenhuma: publicados.filter((v) => conexao(v) === "nenhuma").length,
  };
  const porFarol = {
    led: publicados.filter((v) => farol(v) === "led").length,
    halogeno: publicados.filter((v) => farol(v) === "halogeno").length,
  };
  const porPropulsao = Object.entries(
    publicados.reduce<Record<string, number>>((acc, v) => {
      acc[v.propulsao] = (acc[v.propulsao] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const marcasComModelos = montadoras
    .filter((m) => (m.qtdModelos ?? 0) > 0)
    .sort((a, b) => (b.qtdModelos ?? 0) - (a.qtdModelos ?? 0));
  const maiorMarca = marcasComModelos[0]?.qtdModelos ?? 1;
  const recentes = [...publicados]
    .sort((a, b) => (b.criadoEm ?? "").localeCompare(a.criadoEm ?? ""))
    .slice(0, 6);
  const ultimaVerificacao = todos
    .map((v) => v.verificadoBrEm)
    .filter((d): d is string => !!d)
    .sort()
    .at(-1);

  const indicadores = [
    {
      titulo: "Modelos publicados",
      valor: publicados.length,
      explicacao: "Carros vendidos no Brasil com o pacote mínimo de dados confirmado em fonte oficial.",
      href: "/veiculos",
      acao: "Abrir catálogo",
      icone: Car,
    },
    {
      titulo: "Montadoras",
      valor: montadoras.length,
      explicacao: `Marcas com carros à venda no Brasil (${marcasComModelos.length} já com modelos publicados).`,
      href: "/montadoras",
      acao: "Ver marcas",
      icone: Building2,
    },
    {
      titulo: "Com CarPlay/Android Auto sem fio",
      valor: porConexao.todas + porConexao.algumas,
      explicacao: "Modelos publicados com projeção sem fio em todas ou em algumas versões.",
      href: "/veiculos?conexao=sem-fio",
      acao: "Filtrar esses modelos",
      icone: Wifi,
    },
    {
      titulo: "Em verificação",
      valor: emVerificacao,
      explicacao: "Já cadastrados, mas ainda falta confirmar algum dado obrigatório. Entram sozinhos quando completarem.",
      href: "/admin/veiculos",
      acao: "Ver o que falta (admin)",
      icone: CircleDashed,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoPagina
        titulo="Painel do catálogo"
        descricao="Visão geral dos carros vendidos no Brasil que já estão no catálogo técnico: quantos são, como está a conectividade da central multimídia, o tipo de farol e quais marcas estão mais completas. Clique em qualquer bloco para ver os modelos."
        acoes={
          <>
            <Button variant="outline" asChild>
              <Link href="/busca">
                <Search className="h-4 w-4" />
                Buscar
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

      {/* KPI row: cada bloco leva à lista correspondente */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicadores.map(({ titulo, valor, explicacao, href, acao, icone: Icone }) => (
          <Link
            key={titulo}
            href={href}
            className="group flex flex-col rounded-xl border bg-card p-5 transition-colors hover:border-primary/50"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{titulo}</span>
              <Icone className="h-4 w-4" />
            </div>
            <p className="mt-2 text-4xl font-semibold tabular-nums">{formatarNumero(valor)}</p>
            <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">{explicacao}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              {acao}
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
              CarPlay e Android Auto
            </CardTitle>
            <CardDescription>
              Como o celular se conecta à central nos {publicados.length} modelos publicados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Medidor rotulo="Sem fio em todas as versões" valor={porConexao.todas} total={total} href="/veiculos?conexao=sem-fio" />
            <Medidor rotulo="Sem fio só em algumas versões" valor={porConexao.algumas} total={total} href="/veiculos?conexao=sem-fio" />
            <Medidor
              rotulo="Sem projeção sem fio confirmada"
              valor={porConexao.nenhuma}
              total={total}
              href="/veiculos?conexao=so-cabo"
              ajuda="A fonte não fala em sem fio (pode ser só por cabo)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              Faróis
            </CardTitle>
            <CardDescription>Tecnologia do farol principal informada pela montadora.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <Medidor rotulo="LED em pelo menos uma versão" valor={porFarol.led} total={total} href="/veiculos?farol=led" />
            <Medidor
              rotulo="Só halógeno"
              valor={porFarol.halogeno}
              total={total}
              href="/veiculos?farol=halogeno"
              ajuda="Possível público para kits de iluminação"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Por tipo de motorização</CardTitle>
            <CardDescription>Modelos publicados por propulsão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {porPropulsao.map(([p, n]) => (
              <Medidor key={p} rotulo={p} valor={n} total={total} href={`/veiculos?propulsao=${encodeURIComponent(p)}`} />
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Modelos publicados por marca</CardTitle>
            <CardDescription>Clique numa marca para ver os modelos e o que falta nas que estão em verificação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {marcasComModelos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma marca com modelos publicados ainda.</p>
            ) : (
              marcasComModelos.map((m) => (
                <Link
                  key={m.id}
                  href={`/montadoras/${m.slug}`}
                  title={`${m.nome}: ${m.qtdModelos} publicados, ${m.qtdEmVerificacao ?? 0} em verificação`}
                  className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
                >
                  <LogoMontadora nome={m.nome} slug={m.slug} logotipoUrl={m.logotipoUrl} tamanho="sm" />
                  <span className="w-24 shrink-0 truncate text-sm">{m.nome}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{ width: `${((m.qtdModelos ?? 0) / maiorMarca) * 100}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-sm font-medium tabular-nums">{m.qtdModelos}</span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Adicionados recentemente</CardTitle>
              <CardDescription>Últimos modelos que completaram o pacote mínimo.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/veiculos">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum modelo publicado ainda.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {recentes.map((v) => (
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
                    <div className="p-2.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{v.marca}</p>
                      <p className="truncate text-sm font-semibold group-hover:text-primary">{v.nomeComercial}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-[10px]">{v.categoria}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{v.propulsao}</Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Como um modelo entra no catálogo</CardTitle>
          <CardDescription>
            Os dados vêm dos sites oficiais brasileiros das montadoras e das salas de imprensa. Cada informação guarda a página de origem, a data da consulta e o trecho copiado da fonte.
            {ultimaVerificacao ? ` Última verificação: ${formatarData(ultimaVerificacao)}.` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Obrigatório para publicar</p>
            <ul className="space-y-1.5 text-sm">
              {ITENS_MINIMOS.map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">Registrado como pendência (sem bloquear)</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "CarPlay/Android Auto: separação entre cabo e sem fio",
                "Códigos das lâmpadas (H4, H7, HB3...)",
                "Palhetas: medidas e encaixe",
                "Interruptores dos vidros",
                "Códigos OEM",
              ].map((i) => (
                <li key={i} className="flex items-start gap-2">
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Nada é preenchido por suposição: o que a fonte não informa aparece como “a confirmar”.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/** Linha clicável com rótulo, contagem e barra de proporção (uma só cor). */
function Medidor({
  rotulo,
  valor,
  total,
  href,
  ajuda,
}: {
  rotulo: string;
  valor: number;
  total: number;
  href: string;
  ajuda?: string;
}) {
  const pct = Math.round((valor / total) * 100);
  return (
    <Link
      href={href}
      title={`${rotulo}: ${valor} modelos (${pct}%)`}
      className="block rounded-md px-2 py-1.5 hover:bg-accent"
    >
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span>{rotulo}</span>
        <span className="tabular-nums">
          <span className="font-medium">{valor}</span>
          <span className="ml-1 text-xs text-muted-foreground">{pct}%</span>
        </span>
      </div>
      <span className="mt-1 block h-2 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </span>
      {ajuda ? <span className="mt-0.5 block text-[11px] text-muted-foreground">{ajuda}</span> : null}
    </Link>
  );
}
