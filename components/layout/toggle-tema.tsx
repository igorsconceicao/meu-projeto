"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ToggleTema() {
  const { theme, setTheme } = useTheme();
  const [montado, setMontado] = React.useState(false);

  React.useEffect(() => {
    // Pattern recomendado pelo next-themes para evitar mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMontado(true);
  }, []);

  const alternar = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  if (!montado) {
    return (
      <Button variant="ghost" size="icon" aria-label="Alternar tema">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={alternar}
      aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
