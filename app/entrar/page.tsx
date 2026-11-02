import type { Metadata } from "next";
import { Suspense } from "react";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return (
    <Suspense>
      <FormularioEntrar />
    </Suspense>
  );
}
