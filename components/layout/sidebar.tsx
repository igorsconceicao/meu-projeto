"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAVEGACAO } from "./navegacao";

export function Sidebar({ className, aoNavegar }: { className?: string; aoNavegar?: () => void }) {
  const caminho = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r bg-card/40",
        className,
      )}
    >
      <Link href="/" onClick={aoNavegar} className="flex h-16 items-center gap-2 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Gauge className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Inteligência</span>
          <span className="text-xs text-muted-foreground">
            Automotiva · BR
          </span>
        </div>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAVEGACAO.map((grupo) => (
          <div key={grupo.titulo} className="mb-6">
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {grupo.titulo}
            </p>
            <ul className="flex flex-col gap-0.5">
              {grupo.itens.map((item) => {
                const ativo =
                  item.href === "/"
                    ? caminho === "/"
                    : [item.href, ...(item.tambem ?? [])].some((h) => caminho.startsWith(h));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={aoNavegar}
                      aria-current={ativo ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors",
                        ativo
                          ? "bg-primary/10 text-primary"
                          : "text-foreground/80 hover:bg-accent hover:text-foreground",
                      )}
                    >
                      <item.icone className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col leading-tight">
                        <span className="flex items-center gap-1.5 font-medium">
                          {item.titulo}
                          {item.emBreve ? (
                            <span className="rounded bg-muted px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                              em breve
                            </span>
                          ) : null}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.descricao}
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t px-4 py-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Cada dado com fonte e data</p>
        <p>Atualização automática duas vezes por mês</p>
      </div>
    </aside>
  );
}
