"use client";

import * as React from "react";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marcarNovidade } from "@/app/admin/novidades/acoes";

export function BotoesNovidade({ id, status }: { id: string; status: string }) {
  const [pendente, iniciar] = React.useTransition();
  const marcar = (s: "pendente" | "resolvido" | "ignorado") =>
    iniciar(async () => {
      try {
        await marcarNovidade(id, s);
      } catch (e) {
        alert(e instanceof Error ? e.message : "Erro ao atualizar.");
      }
    });

  if (pendente) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (status !== "pendente") {
    return (
      <Button size="sm" variant="ghost" onClick={() => marcar("pendente")}>
        <RotateCcw className="h-4 w-4" />
        Reabrir
      </Button>
    );
  }
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="outline" onClick={() => marcar("resolvido")} title="Já tratado no catálogo">
        <Check className="h-4 w-4" />
        Resolvido
      </Button>
      <Button size="sm" variant="ghost" onClick={() => marcar("ignorado")} title="Não é um modelo novo">
        <X className="h-4 w-4" />
        Ignorar
      </Button>
    </div>
  );
}
