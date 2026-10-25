import { Check, CircleHelp, Layers, Minus } from "lucide-react";
import type { EstadoConectividade, Multimidia } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const ESTILO: Record<EstadoConectividade, { rotulo: string; classe: string; Icone: typeof Check }> = {
  confirmado: { rotulo: "Sim", classe: "bg-success/15 text-success", Icone: Check },
  depende_versao: { rotulo: "Algumas versões", classe: "bg-warning/15 text-warning", Icone: Layers },
  nao_disponivel: { rotulo: "Não", classe: "bg-muted text-muted-foreground", Icone: Minus },
  nao_identificado: { rotulo: "Sem info", classe: "bg-muted/60 text-muted-foreground", Icone: CircleHelp },
};

/**
 * Etiqueta curta de um estado de conectividade (Sim / Não / Algumas versões / Sem info).
 * `leve` troca o ícone por um ponto — usado nas listas longas para a página ficar leve.
 */
export function MiniEstado({ estado, className, leve }: { estado: EstadoConectividade; className?: string; leve?: boolean }) {
  const { rotulo, classe, Icone } = ESTILO[estado];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", classe, className)}>
      {leve ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : <Icone className="h-3 w-3" />}
      {rotulo}
    </span>
  );
}

/** CarPlay ou Android Auto: disponibilidade e, quando há, cabo e sem fio. */
export function ResumoProjecao({
  geral,
  cabo,
  semFio,
}: {
  geral: EstadoConectividade;
  cabo: EstadoConectividade;
  semFio: EstadoConectividade;
}) {
  if (geral === "nao_identificado") return <MiniEstado estado="nao_identificado" leve />;
  if (geral === "nao_disponivel") return <MiniEstado estado="nao_disponivel" leve />;
  return (
    <span className="grid grid-cols-[auto_auto] items-center justify-start gap-x-2 gap-y-1 text-[11px]">
      <span className="text-muted-foreground">Cabo</span>
      <MiniEstado estado={cabo} leve />
      <span className="text-muted-foreground">Sem fio</span>
      <MiniEstado estado={semFio} leve />
      {geral === "depende_versao" ? <span className="col-span-2 text-muted-foreground">só em algumas versões</span> : null}
    </span>
  );
}

export function projecoes(mm: Multimidia | null | undefined) {
  return {
    carplay: {
      geral: mm?.carplay ?? "nao_identificado",
      cabo: mm?.carplayCabo ?? "nao_identificado",
      semFio: mm?.carplaySemFio ?? "nao_identificado",
    },
    androidAuto: {
      geral: mm?.androidAuto ?? "nao_identificado",
      cabo: mm?.androidAutoCabo ?? "nao_identificado",
      semFio: mm?.androidAutoSemFio ?? "nao_identificado",
    },
  } as const;
}

export { resumoPalhetas } from "@/lib/palhetas";
