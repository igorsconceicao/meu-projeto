import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarNumero(valor: number): string {
  return new Intl.NumberFormat("pt-BR").format(valor);
}

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatarDataCurta(data: Date | string): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR").format(d);
}
