import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconeVeiculo } from "./icone-veiculo";

export type ProporcaoFoto = "16/9" | "4/3" | "1/1" | "3/2";

const PROPORCAO: Record<ProporcaoFoto, string> = {
  "16/9": "aspect-video",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
  "3/2": "aspect-[3/2]",
};

export function FotoVeiculo({
  nome,
  categoria,
  propulsao,
  fotoUrl,
  proporcao = "16/9",
  className,
  mostrarAviso = true,
}: {
  nome: string;
  categoria: string;
  propulsao: string;
  fotoUrl?: string | null;
  proporcao?: ProporcaoFoto;
  className?: string;
  mostrarAviso?: boolean;
}) {
  if (fotoUrl) {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-lg bg-muted",
          PROPORCAO[proporcao],
          className,
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fotoUrl}
          alt={`${nome}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg",
        "bg-gradient-to-br from-secondary via-card to-background",
        "ring-1 ring-border",
        PROPORCAO[proporcao],
        className,
      )}
      role="img"
      aria-label={`${nome} (foto oficial ainda não localizada)`}
      title={`${nome} — foto oficial ainda não localizada`}
    >
      <div className="absolute inset-0 cockpit-glow" aria-hidden="true" />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        <IconeVeiculo
          categoria={categoria}
          propulsao={propulsao}
          className="h-12 w-12 text-muted-foreground/60"
        />
        {mostrarAviso ? (
          <div className="flex items-center gap-1.5 rounded-full border border-dashed border-warning/40 bg-warning/5 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-warning">
            <ImageOff className="h-3 w-3" />
            Foto a confirmar
          </div>
        ) : null}
      </div>
    </div>
  );
}
