import { cn } from "@/lib/utils";

const PALETA_HUE = [12, 212, 142, 48, 330, 268, 190] as const;

function hueFromSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return PALETA_HUE[hash % PALETA_HUE.length];
}

function iniciais(nome: string): string {
  const partes = nome.split(/\s+/).filter(Boolean);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export type TamanhoLogo = "sm" | "md" | "lg" | "xl";

const TAMANHO: Record<TamanhoLogo, { box: string; texto: string; img: string }> = {
  sm: { box: "h-8 w-8", texto: "text-[11px]", img: "h-6 w-6" },
  md: { box: "h-10 w-10", texto: "text-sm", img: "h-7 w-7" },
  lg: { box: "h-16 w-16", texto: "text-xl", img: "h-10 w-10" },
  xl: { box: "h-20 w-20", texto: "text-2xl", img: "h-14 w-14" },
};

export function LogoMontadora({
  nome,
  slug,
  logotipoUrl,
  tamanho = "md",
  className,
}: {
  nome: string;
  slug: string;
  logotipoUrl?: string | null;
  tamanho?: TamanhoLogo;
  className?: string;
}) {
  const t = TAMANHO[tamanho];
  const hue = hueFromSlug(slug);
  const bg = `hsl(${hue} 70% 92%)`;
  const fg = `hsl(${hue} 70% 25%)`;

  if (logotipoUrl) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center rounded-lg bg-white p-1 ring-1 ring-border",
          t.box,
          className,
        )}
        aria-label={`Logotipo ${nome}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logotipoUrl}
          alt={`Logotipo ${nome}`}
          className={cn("object-contain", t.img)}
          loading="lazy"
        />
      </div>
    );
  }

  // Fallback — iniciais em círculo com cor derivada do slug (consistente por marca)
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg font-bold tracking-tight",
        t.box,
        t.texto,
        className,
      )}
      style={{ background: bg, color: fg }}
      aria-label={`${nome} (logotipo não localizado)`}
      title={`${nome} — logotipo oficial ainda não localizado`}
    >
      {iniciais(nome)}
    </div>
  );
}
