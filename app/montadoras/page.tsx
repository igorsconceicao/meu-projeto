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
  // Ordem alfabética (A–Z), separada pela letra inicial
  const ordenadas = [...montadoras].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
  const porLetra = new Map<string, typeof ordenadas>();
  for (const m of ordenadas) {
    const letra = m.nome.normalize("NFD").charAt(0).toUpperCase();
    porLetra.set(letra, [...(porLetra.get(letra) ?? []), m]);
  }
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
        <>
          <nav aria-label="Letras" className="flex flex-wrap gap-1">
            {[...porLetra.keys()].map((letra) => (
              <a
                key={letra}
                href={`#letra-${letra}`}
                className="flex h-8 min-w-8 items-center justify-center rounded-md border bg-card px-2 text-sm font-medium hover:border-primary/40 hover:text-primary"
              >
                {letra}
              </a>
            ))}
          </nav>
          {[...porLetra.entries()].map(([letra, lista]) => (
            <section key={letra} id={`letra-${letra}`} className="scroll-mt-20 space-y-2">
              <h2 className="border-b pb-1 text-lg font-semibold">{letra}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lista.map((m) => (
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
            </section>
          ))}
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Logotipos atuais de cada marca, do Wikimedia Commons (domínio público ou licença livre). O crédito aparece ao passar o mouse sobre o logo.
      </p>
    </div>
  );
}
