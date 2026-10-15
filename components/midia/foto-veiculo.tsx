"use client";

import * as React from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { corDaMarca } from "@/lib/cores-marca";
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
  montadoraSlug,
  proporcao = "16/9",
  className,
  mostrarAviso = true,
}: {
  nome: string;
  categoria: string;
  propulsao: string;
  fotoUrl?: string | null;
  montadoraSlug?: string | null;
  proporcao?: ProporcaoFoto;
  className?: string;
  mostrarAviso?: boolean;
}) {
  const [erroImg, setErroImg] = React.useState(false);
  const temFoto = Boolean(fotoUrl) && !erroImg;

  if (temFoto) {
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
          src={fotoUrl!}
          alt={`${nome}`}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setErroImg(true)}
        />
      </div>
    );
  }

  const { base, claro } = corDaMarca(montadoraSlug);
  const gradient = `linear-gradient(135deg, ${claro} 0%, ${base} 60%, #0b0f1a 100%)`;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg ring-1 ring-border/40",
        PROPORCAO[proporcao],
        className,
      )}
      style={{ background: gradient }}
      role="img"
      aria-label={`${nome} (foto oficial ainda não localizada)`}
      title={`${nome} — foto oficial ainda não localizada`}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 55%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 cockpit-glow opacity-40" aria-hidden="true" />
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        <IconeVeiculo
          categoria={categoria}
          propulsao={propulsao}
          className="h-12 w-12 text-white/90 drop-shadow"
        />
        {mostrarAviso ? (
          <div className="flex items-center gap-1.5 rounded-full border border-white/30 bg-black/30 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/90 backdrop-blur-sm">
            <ImageOff className="h-3 w-3" />
            Foto a confirmar
          </div>
        ) : null}
      </div>
    </div>
  );
}
