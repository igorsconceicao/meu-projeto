import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export function AlertaDemo({
  className,
  mensagem,
}: {
  className?: string;
  mensagem?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-dashed border-warning/50 bg-warning/10 p-4 text-sm",
        className,
      )}
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
      <div className="flex-1">
        <p className="font-medium text-warning">Dados de demonstração</p>
        <p className="text-muted-foreground">
          {mensagem ??
            "Os números e informações exibidos nesta tela são fictícios e servem apenas para visualizar o layout. Serão substituídos por dados reais nas próximas iterações do projeto."}
        </p>
      </div>
    </div>
  );
}
