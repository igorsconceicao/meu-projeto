"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Opcao = { valor: string; rotulo: string };

const CLASSE_SELECT =
  "h-9 rounded-md border border-input bg-background px-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring";

/** Barra de filtros do catálogo: atualiza a URL (?q=&marca=...) e a página filtra no servidor. */
export function FiltrosCatalogo({
  marcas,
  categorias,
  propulsoes,
}: {
  marcas: Opcao[];
  categorias: string[];
  propulsoes: string[];
}) {
  const router = useRouter();
  const caminho = usePathname();
  const params = useSearchParams();
  const [texto, setTexto] = React.useState(params.get("q") ?? "");

  const aplicar = React.useCallback(
    (chave: string, valor: string) => {
      const p = new URLSearchParams(params.toString());
      if (valor) p.set(chave, valor);
      else p.delete(chave);
      router.replace(`${caminho}${p.size ? `?${p}` : ""}`, { scroll: false });
    },
    [caminho, params, router],
  );

  // Texto livre: aplica 300 ms depois que a pessoa para de digitar.
  React.useEffect(() => {
    if (texto === (params.get("q") ?? "")) return;
    const t = setTimeout(() => aplicar("q", texto.trim()), 300);
    return () => clearTimeout(t);
  }, [texto, params, aplicar]);

  const temFiltro = ["q", "marca", "categoria", "propulsao", "conexao"].some((k) => params.get(k));

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-card p-3 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Filtrar por modelo, motor, multimídia..."
          className="pl-9"
          aria-label="Filtrar veículos"
        />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <select
          className={CLASSE_SELECT}
          value={params.get("marca") ?? ""}
          onChange={(e) => aplicar("marca", e.target.value)}
          aria-label="Marca"
        >
          <option value="">Todas as marcas</option>
          {marcas.map((m) => (
            <option key={m.valor} value={m.valor}>
              {m.rotulo}
            </option>
          ))}
        </select>
        <select
          className={CLASSE_SELECT}
          value={params.get("categoria") ?? ""}
          onChange={(e) => aplicar("categoria", e.target.value)}
          aria-label="Categoria"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          className={CLASSE_SELECT}
          value={params.get("propulsao") ?? ""}
          onChange={(e) => aplicar("propulsao", e.target.value)}
          aria-label="Propulsão"
        >
          <option value="">Toda propulsão</option>
          {propulsoes.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          className={CLASSE_SELECT}
          value={params.get("conexao") ?? ""}
          onChange={(e) => aplicar("conexao", e.target.value)}
          aria-label="Conectividade"
        >
          <option value="">Qualquer conectividade</option>
          <option value="sem-fio">CarPlay/Android Auto sem fio</option>
          <option value="so-cabo">Sem projeção sem fio confirmada</option>
        </select>
      </div>
      {temFiltro ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTexto("");
            router.replace(caminho, { scroll: false });
          }}
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      ) : null}
    </div>
  );
}
