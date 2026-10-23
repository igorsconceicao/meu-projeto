import { Check, CircleHelp, Layers, Minus } from "lucide-react";
import type { EstadoConectividade, Multimidia, Palheta } from "@/lib/tipos";
import { cn } from "@/lib/utils";

const ESTILO: Record<EstadoConectividade, { rotulo: string; classe: string; Icone: typeof Check }> = {
  confirmado: { rotulo: "Sim", classe: "bg-success/15 text-success", Icone: Check },
  depende_versao: { rotulo: "Algumas versões", classe: "bg-warning/15 text-warning", Icone: Layers },
  nao_disponivel: { rotulo: "Não", classe: "bg-muted text-muted-foreground", Icone: Minus },
  nao_identificado: { rotulo: "Sem info", classe: "bg-muted/60 text-muted-foreground", Icone: CircleHelp },
};

/** Etiqueta curta de um estado de conectividade (Sim / Não / Algumas versões / Sem info). */
export function MiniEstado({ estado, className }: { estado: EstadoConectividade; className?: string }) {
  const { rotulo, classe, Icone } = ESTILO[estado];
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", classe, className)}>
      <Icone className="h-3 w-3" />
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
  if (geral === "nao_identificado") return <MiniEstado estado="nao_identificado" />;
  if (geral === "nao_disponivel") return <MiniEstado estado="nao_disponivel" />;
  return (
    <div className="flex flex-col gap-1 text-[11px]">
      <span className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">Cabo</span>
        <MiniEstado estado={cabo} />
      </span>
      <span className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">Sem fio</span>
        <MiniEstado estado={semFio} />
      </span>
      {geral === "depende_versao" ? <span className="text-muted-foreground">(só em algumas versões)</span> : null}
    </div>
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

function medida(p: Palheta): string | null {
  if (p.medidaPol && p.medidaMm) return `${p.medidaPol}" (${p.medidaMm} mm)`;
  if (p.medidaPol) return `${p.medidaPol}"`;
  if (p.medidaMm) return `${p.medidaMm} mm`;
  return null;
}

/** Medidas das palhetas em texto curto: dianteiras (motorista + passageiro) e traseira. */
export function resumoPalhetas(palhetas: Palheta[] | undefined) {
  const lista = palhetas ?? [];
  const motorista = lista.find((p) => /diant/i.test(p.posicao) && /motor/i.test(p.posicao));
  const passageiro = lista.find((p) => /diant/i.test(p.posicao) && /passag/i.test(p.posicao));
  const outraDianteira = lista.find((p) => /diant/i.test(p.posicao) && p !== motorista && p !== passageiro);
  const traseira = lista.find((p) => /tras/i.test(p.posicao));
  const dianteiras = [motorista, passageiro, outraDianteira].filter((p): p is Palheta => !!p).map(medida).filter(Boolean);
  return {
    dianteira: dianteiras.length ? dianteiras.join(" + ") : null,
    traseira: traseira ? medida(traseira) : null,
  };
}
