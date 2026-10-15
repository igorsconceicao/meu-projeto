import { Car, CarFront, Truck, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function IconeVeiculo({
  categoria,
  propulsao,
  className,
  strokeWidth = 1.5,
}: {
  categoria: string;
  propulsao: string;
  className?: string;
  strokeWidth?: number;
}) {
  const classes = cn("h-6 w-6", className);
  if (propulsao === "Elétrico") {
    return <Zap className={classes} strokeWidth={strokeWidth} aria-hidden="true" />;
  }
  if (categoria === "Picape" || categoria === "Utilitário") {
    return <Truck className={classes} strokeWidth={strokeWidth} aria-hidden="true" />;
  }
  if (categoria === "SUV") {
    return <CarFront className={classes} strokeWidth={strokeWidth} aria-hidden="true" />;
  }
  return <Car className={classes} strokeWidth={strokeWidth} aria-hidden="true" />;
}
