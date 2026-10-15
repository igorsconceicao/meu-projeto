import { Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { FotoVeiculo } from "./foto-veiculo";

export function GaleriaVeiculo({
  nome,
  categoria,
  propulsao,
  galeria,
  fotoPrincipal,
  className,
}: {
  nome: string;
  categoria: string;
  propulsao: string;
  galeria?: string[];
  fotoPrincipal?: string | null;
  className?: string;
}) {
  const urls = (galeria ?? []).filter(Boolean);
  const total = urls.length + (fotoPrincipal ? 1 : 0);

  if (total === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-10 text-center",
          className,
        )}
      >
        <Images className="h-10 w-10 text-muted-foreground/60" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-medium">Galeria ainda não localizada</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Fotos oficiais serão coletadas automaticamente a partir da Iteração 6
            (sala de imprensa das montadoras, kits de mídia e galerias oficiais).
          </p>
        </div>
      </div>
    );
  }

  const todas = [...(fotoPrincipal ? [fotoPrincipal] : []), ...urls];

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4",
        className,
      )}
    >
      {todas.map((url, idx) => (
        <FotoVeiculo
          key={`${url}-${idx}`}
          nome={nome}
          categoria={categoria}
          propulsao={propulsao}
          fotoUrl={url}
          proporcao="4/3"
          mostrarAviso={false}
        />
      ))}
    </div>
  );
}
