import { Lightbulb, MonitorSmartphone, Plus } from "lucide-react";
import { FonteDado } from "@/components/tecnico/elementos";
import { Badge } from "@/components/ui/badge";
import type { LinhaVersoes, Rastreio, Versao } from "@/lib/tipos";

/** Linha de versões do modelo, da de entrada à topo, com o que cada uma acrescenta. */
export function ListaVersoes({ versoes, linha }: { versoes: Versao[]; linha: LinhaVersoes | null }) {
  if (!versoes.length) {
    return <p className="text-sm text-muted-foreground">Versões ainda não levantadas para este modelo.</p>;
  }
  const fontes = Array.from(
    new Map([linha, ...versoes].filter((d): d is NonNullable<typeof d> => !!d).map((d) => [d.fonteUrl, d as Rastreio])).values(),
  );
  return (
    <div className="space-y-4">
      {linha?.nomenclatura ? (
        <div className="rounded-md bg-muted/40 p-3 text-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Como a marca nomeia as versões</p>
          <p className="mt-1">{linha.nomenclatura}</p>
        </div>
      ) : null}
      <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {versoes.map((v, i) => (
          <li key={v.nome} className="flex flex-col gap-2 rounded-md border p-3">
            <div className="flex items-start gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{v.nome}</p>
                {v.nomeCompleto && v.nomeCompleto !== v.nome ? (
                  <p className="text-xs text-muted-foreground">{v.nomeCompleto}</p>
                ) : null}
              </div>
              {v.posicionamento ? <Badge variant="secondary">{v.posicionamento}</Badge> : null}
            </div>
            {v.motor || v.cambio ? (
              <p className="text-xs text-muted-foreground">{[v.motor, v.cambio].filter(Boolean).join(" · ")}</p>
            ) : null}
            {v.diferencial ? <p className="text-sm">{v.diferencial}</p> : null}
            {v.itensAdicionais.length ? (
              <div>
                <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Plus className="h-3 w-3" />
                  {v.baseComparacao
                    ? `Acrescenta em relação à ${v.baseComparacao}`
                    : i === 0
                      ? "Itens de série"
                      : "Destaques da versão"}
                </p>
                <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm">
                  {v.itensAdicionais.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            {v.multimidia || v.iluminacao ? (
              <div className="mt-auto space-y-1 border-t pt-2 text-xs text-muted-foreground">
                {v.multimidia ? (
                  <p className="flex gap-1.5">
                    <MonitorSmartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {v.multimidia}
                  </p>
                ) : null}
                {v.iluminacao ? (
                  <p className="flex gap-1.5">
                    <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    {v.iluminacao}
                  </p>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ol>
      {linha?.observacoes ? <p className="text-xs text-muted-foreground">{linha.observacoes}</p> : null}
      {fontes.map((d) => (
        <FonteDado key={d.fonteUrl} dado={d} />
      ))}
    </div>
  );
}
