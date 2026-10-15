import { CheckCircle2, CircleDashed, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
import type { EstadoConectividade, ItemChecklist, Rastreio } from "@/lib/tipos";
import { cn, formatarData } from "@/lib/utils";

const ROTULOS_ESTADO: Record<
  EstadoConectividade,
  { label: string; curto: string; variant: "success" | "secondary" | "warning" }
> = {
  confirmado: { label: "Confirmado", curto: "sim", variant: "success" },
  nao_disponivel: { label: "Não disponível", curto: "não", variant: "secondary" },
  nao_identificado: { label: "Não identificado", curto: "?", variant: "warning" },
  depende_versao: { label: "Depende da versão", curto: "conforme versão", variant: "warning" },
};

export function BadgeEstado({ estado }: { estado: EstadoConectividade }) {
  const cfg = ROTULOS_ESTADO[estado];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function rotuloCurtoEstado(estado: EstadoConectividade): string {
  return ROTULOS_ESTADO[estado].curto;
}

function hostDe(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Rodapé de rastreabilidade: fonte, data de consulta, confiança e trecho. */
export function FonteDado({ dado, className }: { dado: Rastreio; className?: string }) {
  return (
    <div className={cn("space-y-2 rounded-md border border-dashed p-3 text-xs", className)}>
      <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
        <span>Fonte:</span>
        <a
          href={dado.fonteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          {hostDe(dado.fonteUrl)}
          <ExternalLink className="h-3 w-3" />
        </a>
        <span>· consultado em {formatarData(dado.consultadoEm)}</span>
        <BadgeConfianca nivel={dado.confianca} />
      </div>
      {dado.evidencia ? (
        <details>
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            Ver trecho da fonte
          </summary>
          <p className="mt-1 whitespace-pre-line rounded bg-muted/50 p-2 italic text-muted-foreground">
            “{dado.evidencia}”
          </p>
        </details>
      ) : null}
    </div>
  );
}

export function ListaChecklist({ itens, className }: { itens: ItemChecklist[]; className?: string }) {
  return (
    <ul className={cn("grid gap-1.5 text-sm", className)}>
      {itens.map((i) => (
        <li key={i.chave} className="flex items-center gap-2">
          {i.ok ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          ) : (
            <CircleDashed className="h-4 w-4 shrink-0 text-warning" />
          )}
          <span className={i.ok ? undefined : "text-muted-foreground"}>{i.rotulo}</span>
        </li>
      ))}
    </ul>
  );
}
