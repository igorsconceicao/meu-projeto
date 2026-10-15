import { ExternalLink, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function BotaoSiteOficial({
  url,
  marca,
  texto = "Conheça no site oficial",
  variant = "default",
  size = "default",
  className,
}: {
  url?: string | null;
  marca: string;
  texto?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  if (!url) {
    return (
      <Badge
        variant="secondary"
        className={cn("gap-1.5 font-normal", className)}
        title={`Página oficial de ${marca} ainda não localizada`}
      >
        <Globe className="h-3 w-3" />
        Site oficial a confirmar
      </Badge>
    );
  }

  return (
    <Button variant={variant} size={size} asChild className={className}>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        aria-label={`${texto} — ${marca} (abre em nova aba)`}
      >
        <Globe className="h-4 w-4" />
        {texto}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}
