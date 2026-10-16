import Link from "next/link";
import { Building2, Car, Cpu, Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { ResumoTecnicoCard } from "@/components/tecnico/resumo-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buscarNoCatalogo } from "@/lib/busca";

export const dynamic = "force-dynamic";
export const metadata = { title: "Busca" };

const EXEMPLOS = ["CarPlay sem fio", "Full LED", "1.0 turbo", "híbrido", "picape diesel", "BYD"];

export default async function PaginaBusca({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const r = await buscarNoCatalogo(q);
  const total = r.montadoras.length + r.veiculos.length + r.componentes.length;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Busca no catálogo"
        descricao="Procure por marca, modelo, categoria, motor, câmbio, central multimídia (ex.: “CarPlay sem fio”), tipo de farol ou código de lâmpada/OEM. Só aparecem modelos publicados, com dados confirmados em fonte oficial."
      />

      <form action="/busca" className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Ex.: Tracker, CarPlay sem fio, Full LED..." className="pl-9" autoFocus />
        </div>
        <Button type="submit">Buscar</Button>
      </form>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>Experimente:</span>
        {EXEMPLOS.map((e) => (
          <Link key={e} href={`/busca?q=${encodeURIComponent(e)}`} className="rounded-full border px-2.5 py-1 hover:bg-accent hover:text-foreground">
            {e}
          </Link>
        ))}
      </div>

      {q.trim() ? (
        <p className="text-sm text-muted-foreground">
          {total === 0 ? "Nenhum resultado" : `${total} resultado${total === 1 ? "" : "s"}`} para{" "}
          <span className="font-medium text-foreground">“{q}”</span>
          {r.emVerificacao > 0
            ? ` · mais ${r.emVerificacao} modelo${r.emVerificacao === 1 ? "" : "s"} em verificação (ainda sem o pacote mínimo de dados)`
            : ""}
        </p>
      ) : null}

      {r.montadoras.length ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Building2 className="h-4 w-4" /> Montadoras</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.montadoras.map((m) => (
              <Link key={m.id} href={`/montadoras/${m.slug}`} className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/40">
                <LogoMontadora nome={m.nome} slug={m.slug} logotipoUrl={m.logotipoUrl} tamanho="md" />
                <div className="min-w-0">
                  <p className="font-medium">{m.nome}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.qtdModelos ?? 0} publicados · {m.qtdEmVerificacao ?? 0} em verificação
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {r.veiculos.length ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Car className="h-4 w-4" /> Veículos</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {r.veiculos.map((v) => (
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
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{v.marca}</p>
                    <p className="font-semibold group-hover:text-primary">{v.nomeComercial}</p>
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
        </section>
      ) : null}

      {r.componentes.length ? (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Cpu className="h-4 w-4" /> Componentes com código</h2>
          <ul className="divide-y rounded-lg border bg-card">
            {r.componentes.map((c, i) => (
              <li key={i}>
                <Link href={`/veiculos/${c.veiculo.slug}`} className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm hover:bg-accent">
                  <span className="font-mono">{c.codigo}</span>
                  <span className="text-muted-foreground">
                    {c.tipo} · {c.posicao} · {c.veiculo.marca} {c.veiculo.nomeComercial}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
