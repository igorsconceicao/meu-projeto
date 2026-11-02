"use client";

import * as React from "react";
import Image from "next/image";
import { podeOtimizar, urlCommons } from "@/lib/imagens";

/**
 * Foto de site externo carregada do jeito mais leve possível:
 * 1º versão otimizada pela Vercel (WebP no tamanho exibido);
 * 2º se o site de origem recusar, a foto original direto do navegador;
 * 3º se nem assim carregar, avisa quem chamou (onFalha) para mostrar o substituto.
 */
export function ImagemRemota({
  src,
  alt,
  sizes,
  larguraCommons,
  className,
  onCarregar,
  onFalha,
  prioridade = false,
}: {
  src: string;
  alt: string;
  /** Largura exibida, no formato do atributo sizes (ex.: "(max-width: 640px) 100vw, 320px"). */
  sizes: string;
  /** Largura (px) pedida ao Wikimedia Commons. */
  larguraCommons: number;
  className?: string;
  onCarregar?: (img: HTMLImageElement) => void;
  onFalha?: () => void;
  prioridade?: boolean;
}) {
  const [direto, setDireto] = React.useState(!podeOtimizar(src));
  const ref = React.useRef<HTMLImageElement>(null);
  const url = direto ? urlCommons(src, larguraCommons) : src;

  // A imagem pode terminar de carregar antes da hidratação, quando o onLoad já passou.
  React.useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth) onCarregar?.(img);
  }, [url, onCarregar]);

  return (
    <Image
      ref={ref}
      src={url}
      alt={alt}
      fill
      sizes={sizes}
      unoptimized={direto}
      preload={prioridade}
      className={className}
      onLoad={(e) => onCarregar?.(e.currentTarget)}
      onError={() => (direto ? onFalha?.() : setDireto(true))}
    />
  );
}
