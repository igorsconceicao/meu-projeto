import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { Badge } from "@/components/ui/badge";
import { buscarMontadoras } from "@/lib/dados/montadoras";

export const metadata = {
  title: "Montadoras",
};

export const dynamic = "force-dynamic";

export default async function PaginaMontadoras() {
  const montadoras = await buscarMontadoras();
  // Marcas com mais modelos publicados primeiro
  const ordenadas = [...montadoras].sort(
    (a, b) => (b.qtdModelos ?? 0) - (a.qtdModelos ?? 0) || a.nome.localeCompare(b.nome),
  );
  const totalPublicados = montadoras.reduce((s, m) => s + (m.qtdModelos ?? 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Montadoras e marcas"
        descricao={`${montadoras.length} marcas com carros vendidos no Brasil e ${totalPublicados} modelos publicados. Clique numa marca para ver os modelos dela, o resumo de conectividade e faróis, e o que ainda está em verificação.`}
      />

      {montadoras.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma montadora cadastrada ainda.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordenadas.map((m) => (
            <Link
              key={m.id}
              href={`/montadoras/${m.slug}`}
              className="group flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <LogoMontadora nome={m.nome} slug={m.slug} logotipoUrl={m.logotipoUrl} logotipoCredito={m.logotipoCredito} tamanho="lg" />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate font-semibold leading-tight group-hover:text-primary">{m.nome}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {[m.grupo, m.pais].filter(Boolean).join(" · ")}
                </p>
                <div className="flex flex-wrap gap-1 pt-0.5">
                  <Badge variant={(m.qtdModelos ?? 0) > 0 ? "success" : "secondary"} className="text-[10px]">
                    {m.qtdModelos ?? 0} publicado{m.qtdModelos === 1 ? "" : "s"}
                  </Badge>
                  {(m.qtdEmVerificacao ?? 0) > 0 ? (
                    <Badge variant="warning" className="text-[10px]">
                      {m.qtdEmVerificacao} em verificação
                    </Badge>
                  ) : null}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Logotipos atuais de cada marca, do Wikimedia Commons (domínio público ou licença livre). O crédito aparece ao passar o mouse sobre o logo.
      </p>
    </div>
  );
}
