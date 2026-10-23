import { CheckCircle2, HelpCircle, ShieldQuestion } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type NivelConfianca =
  | "confirmado"
  | "bem_fundamentado"
  | "nao_confirmado";

const CONFIG: Record<
  NivelConfianca,
  { label: string; variant: "success" | "warning" | "secondary"; Icon: typeof CheckCircle2 }
> = {
  confirmado: {
    label: "Fonte oficial",
    variant: "success",
    Icon: CheckCircle2,
  },
  bem_fundamentado: {
    label: "Imprensa / catálogo",
    variant: "warning",
    Icon: ShieldQuestion,
  },
  nao_confirmado: {
    label: "Internet — conferir",
    variant: "secondary",
    Icon: HelpCircle,
  },
};

export function BadgeConfianca({ nivel }: { nivel: NivelConfianca }) {
  const { label, variant, Icon } = CONFIG[nivel];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
