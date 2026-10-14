import { cn } from "@/lib/utils";

export function CabecalhoPagina({
  titulo,
  descricao,
  acoes,
  className,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b pb-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {titulo}
        </h1>
        {descricao ? (
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            {descricao}
          </p>
        ) : null}
      </div>
      {acoes ? <div className="flex flex-wrap gap-2">{acoes}</div> : null}
    </div>
  );
}
