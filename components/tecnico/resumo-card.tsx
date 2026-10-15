import { Gauge, Lightbulb, MonitorSmartphone } from "lucide-react";
import { rotuloCurtoEstado } from "@/components/tecnico/elementos";
import type { DadosTecnicos } from "@/lib/tipos";

/** Linhas curtas de destaque técnico para os cartões do catálogo. */
export function ResumoTecnicoCard({ tecnicos }: { tecnicos?: DadosTecnicos }) {
  if (!tecnicos) return null;
  const { ficha, multimidia: mm, iluminacao } = tecnicos;
  const farol = iluminacao.find((i) => /farol/i.test(i.posicao) && i.tecnologia);

  const linhas: { icone: typeof Gauge; texto: string }[] = [];
  const motor = [ficha?.motor, ficha?.potencia].filter(Boolean).join(" · ");
  if (motor) linhas.push({ icone: Gauge, texto: motor });
  if (mm) {
    const partes = [
      mm.telaPolegadas ? `Tela ${mm.telaPolegadas}` : null,
      `CarPlay: ${rotuloCurtoEstado(mm.carplay)}`,
      `Android Auto: ${rotuloCurtoEstado(mm.androidAuto)}`,
    ].filter(Boolean);
    linhas.push({ icone: MonitorSmartphone, texto: partes.join(" · ") });
  }
  if (farol) linhas.push({ icone: Lightbulb, texto: `Faróis: ${farol.tecnologia}` });
  if (!linhas.length) return null;

  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {linhas.map(({ icone: Icone, texto }) => (
        <li key={texto} className="flex items-start gap-1.5">
          <Icone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-2">{texto}</span>
        </li>
      ))}
    </ul>
  );
}
