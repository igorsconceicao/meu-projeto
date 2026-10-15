import { ExternalLink, PlayCircle, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

type VideoResolvido =
  | { tipo: "youtube"; embedUrl: string; linkOriginal: string }
  | { tipo: "vimeo"; embedUrl: string; linkOriginal: string }
  | { tipo: "externo"; linkOriginal: string };

function resolverVideo(url: string): VideoResolvido | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) {
        return {
          tipo: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${v}`,
          linkOriginal: url,
        };
      }
    }
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "");
      if (id) {
        return {
          tipo: "youtube",
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
          linkOriginal: url,
        };
      }
    }
    if (host === "vimeo.com") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) {
        return {
          tipo: "vimeo",
          embedUrl: `https://player.vimeo.com/video/${id}`,
          linkOriginal: url,
        };
      }
    }
    return { tipo: "externo", linkOriginal: url };
  } catch {
    return null;
  }
}

export function VideoOficialEmbed({
  url,
  nome,
  className,
}: {
  url?: string | null;
  nome: string;
  className?: string;
}) {
  if (!url) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <PlayCircle className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.5} />
        <p className="font-medium text-foreground">Vídeo oficial não localizado</p>
        <p className="max-w-sm text-xs">
          Quando a montadora publicar uma apresentação oficial do modelo,
          o vídeo aparecerá aqui automaticamente.
        </p>
      </div>
    );
  }

  const video = resolverVideo(url);
  if (!video) {
    return null;
  }

  if (video.tipo === "externo") {
    return (
      <a
        href={video.linkOriginal}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent",
          className,
        )}
      >
        <PlayCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
        <div className="flex-1">
          <p className="text-sm font-medium">Vídeo oficial · {nome}</p>
          <p className="text-xs text-muted-foreground">
            Abrir no site original
          </p>
        </div>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </a>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
        <iframe
          src={video.embedUrl}
          title={`Vídeo oficial — ${nome}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {video.tipo === "youtube" ? (
            <Youtube className="h-3.5 w-3.5" />
          ) : (
            <PlayCircle className="h-3.5 w-3.5" />
          )}
          Vídeo incorporado · {video.tipo === "youtube" ? "YouTube" : "Vimeo"}
        </span>
        <a
          href={video.linkOriginal}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          Abrir no original
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
