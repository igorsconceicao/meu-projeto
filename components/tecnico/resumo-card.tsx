import { Lightbulb, MonitorSmartphone, Wind } from "lucide-react";
import { resumoPalhetas } from "@/components/tecnico/conectividade";
import type { DadosTecnicos, EstadoConectividade } from "@/lib/tipos";

const CURTO: Record<EstadoConectividade, string> = {
  confirmado: "sim",
  depende_versao: "algumas versões",
  nao_disponivel: "não",
  nao_identificado: "sem info",
};

/** Linhas curtas para os cartões: CarPlay/Android Auto (sem fio), palhetas e farol. */
export function ResumoTecnicoCard({ tecnicos }: { tecnicos?: DadosTecnicos }) {
  if (!tecnicos) return null;
  const { multimidia: mm, iluminacao, palhetas } = tecnicos;
  const farol = iluminacao.find((i) => /farol/i.test(i.posicao) && (i.tecnologia || i.codigo));
  const pal = resumoPalhetas(palhetas);

  const linhas: { icone: typeof Wind; texto: string }[] = [];
  if (mm) {
    linhas.push({
      icone: MonitorSmartphone,
      texto: [
        mm.telaPolegadas ? `Tela ${mm.telaPolegadas}` : null,
        `CarPlay sem fio: ${CURTO[mm.carplaySemFio]}`,
        `Android Auto sem fio: ${CURTO[mm.androidAutoSemFio]}`,
      ]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (pal.dianteira || pal.traseira) {
    linhas.push({
      icone: Wind,
      texto: [pal.dianteira ? `Palhetas: ${pal.dianteira}` : null, pal.traseira ? `traseira ${pal.traseira}` : null]
        .filter(Boolean)
        .join(" · "),
    });
  }
  if (farol) {
    linhas.push({ icone: Lightbulb, texto: [`Farol: ${farol.tecnologia ?? "—"}`, farol.codigo].filter(Boolean).join(" · ") });
  }
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
