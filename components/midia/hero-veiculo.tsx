import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Veiculo } from "@/lib/dados-demo";
import { FotoVeiculo } from "./foto-veiculo";
import { LogoMontadora } from "./logo-montadora";

export function HeroVeiculo({
  veiculo,
  logotipoMontadoraUrl,
  className,
}: {
  veiculo: Veiculo;
  logotipoMontadoraUrl?: string | null;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card",
        className,
      )}
    >
      <div className="grid gap-0 md:grid-cols-[2fr_1fr]">
        <div className="relative">
          <FotoVeiculo
            nome={`${veiculo.marca} ${veiculo.nomeComercial}`}
            categoria={veiculo.categoria}
            propulsao={veiculo.propulsao}
            fotoUrl={veiculo.fotoPrincipalUrl ?? null}
            montadoraSlug={veiculo.montadoraSlug}
            proporcao="16/9"
            className="rounded-none"
            mostrarAviso={false}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-card/80" />
          {!veiculo.fotoPrincipalUrl ? (
            <Badge
              variant="demo"
              className="absolute left-3 top-3 gap-1"
            >
              foto a confirmar
            </Badge>
          ) : null}
          {veiculo.fotoPrincipalCredito ? (
            <div className="pointer-events-none absolute bottom-2 right-2 max-w-[70%] truncate rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white/90 backdrop-blur-sm">
              Foto: {veiculo.fotoPrincipalCredito}
            </div>
          ) : null}
        </div>
        <div className="flex flex-col justify-between gap-4 p-5 md:p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <LogoMontadora
                nome={veiculo.marca}
                slug={veiculo.montadoraSlug}
                logotipoUrl={logotipoMontadoraUrl}
                tamanho="lg"
              />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {veiculo.marca}
                </p>
                <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                  {veiculo.nomeComercial}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{veiculo.categoria}</Badge>
              <Badge variant="outline">{veiculo.propulsao}</Badge>
              <Badge variant="outline">Ano {veiculo.anoModelo}</Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">
              {veiculo.resumo}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
