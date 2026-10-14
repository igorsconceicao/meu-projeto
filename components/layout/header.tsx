"use client";

import * as React from "react";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
} from "@/components/ui/sheet";
import { ToggleTema } from "./toggle-tema";
import { Sidebar } from "./sidebar";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <Sheet>
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
          <Sidebar className="border-r-0" />
        </SheetContent>
      </Sheet>

      <form
        className="relative flex-1 max-w-xl"
        onSubmit={(e) => e.preventDefault()}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Buscar marca, modelo, versão, código OEM, componente..."
          className="pl-9"
          aria-label="Busca global"
        />
      </form>

      <div className="flex items-center gap-1">
        <ToggleTema />
      </div>
    </header>
  );
}
