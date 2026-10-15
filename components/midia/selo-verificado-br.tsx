import { BadgeCheck, CircleHelp, ExternalLink } from "lucide-react";
import { cn, formatarData } from "@/lib/utils";

export function SeloVerificadoBr({
  url,
  em,
  compacto = false,
  className,
}: {
  url: string | null;
  em: string | null;
  compacto?: boolean;
  className?: string;
}) {
  if (!url) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning",
          className,
        )}
        title="Comercialização no Brasil ainda não confirmada em fonte oficial"
      >
        <CircleHelp className="h-3 w-3" />
        Venda no Brasil a confirmar
      </span>
    );
  }

  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "fonte oficial";
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success transition-colors hover:bg-success/20",
        className,
      )}
      title={`Confirmado em ${host}${em ? ` em ${formatarData(em)}` : ""}`}
    >
      <BadgeCheck className="h-3 w-3" />
      {compacto ? "Vendido no Brasil" : `Vendido no Brasil · ${host}`}
      {!compacto && em ? <span className="opacity-80">· {formatarData(em)}</span> : null}
      <ExternalLink className="h-3 w-3 opacity-70" />
    </a>
  );
}
