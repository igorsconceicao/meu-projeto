"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { BuscaGlobal } from "./busca-global";
import { ToggleTema } from "./toggle-tema";
import { Sidebar } from "./sidebar";

export function Header() {
  const [menuAberto, setMenuAberto] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Sheet open={menuAberto} onOpenChange={setMenuAberto}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu de navegação</SheetTitle>
          </SheetHeader>
          <Sidebar className="border-r-0" aoNavegar={() => setMenuAberto(false)} />
        </SheetContent>
      </Sheet>

      <BuscaGlobal />

      <div className="flex items-center gap-1">
        <ToggleTema />
      </div>
    </header>
  );
}
