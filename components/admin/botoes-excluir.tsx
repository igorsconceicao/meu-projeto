"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { excluirMontadora, excluirVeiculo } from "@/app/admin/acoes";

function BotaoExcluir({
  nome,
  acao,
  label = "Excluir",
}: {
  nome: string;
  acao: () => Promise<void>;
  label?: string;
}) {
  const [carregando, setCarregando] = React.useState(false);

  async function clicar() {
    const confirmar = window.confirm(
      `Excluir "${nome}"? Esta ação não pode ser desfeita.`,
    );
    if (!confirmar) return;
    setCarregando(true);
    try {
      await acao();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir.");
      setCarregando(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      onClick={clicar}
      disabled={carregando}
      aria-label={`${label} ${nome}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {carregando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}

export function BotaoExcluirMontadora({ id, nome }: { id: string; nome: string }) {
  return (
    <BotaoExcluir
      nome={nome}
      acao={async () => {
        await excluirMontadora(id);
      }}
    />
  );
}

export function BotaoExcluirVeiculo({ id, nome }: { id: string; nome: string }) {
  return (
    <BotaoExcluir
      nome={nome}
      acao={async () => {
        await excluirVeiculo(id);
      }}
    />
  );
}
