"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { acaoSair } from "@/lib/auth/acoes";
import { BuscaGlobal } from "./busca-global";
import { ToggleTema } from "./toggle-tema";
import { Sidebar } from "./sidebar";

export function Header({ nome, admin }: { nome: string; admin: boolean }) {
  const [menuAberto, setMenuAberto] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md md:gap-3 md:px-6">
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden" aria-label="Abrir menu">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <Sidebar className="border-r-0" admin={admin} aoNavegar={() => setMenuAberto(false)} />
        </SheetContent>
      </Sheet>

      <BuscaGlobal />

      <div className="flex shrink-0 items-center gap-1">
        <ToggleTema />
        <span
          className="ml-1 hidden items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm lg:inline-flex"
          title={admin ? "Administrador" : "Leitura"}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {nome.charAt(0).toUpperCase()}
          </span>
          {nome}
        </span>
        <Button variant="ghost" size="icon" asChild aria-label="Trocar senha" title="Trocar senha">
          <Link href="/trocar-senha">
            <KeyRound className="h-4 w-4" />
          </Link>
        </Button>
        <form action={acaoSair}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sair" title="Sair">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
