import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-bold">404</p>
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="max-w-md text-muted-foreground">
        O endereço acessado não existe ou foi removido. Volte para o dashboard e continue sua pesquisa.
      </p>
      <Button asChild>
        <Link href="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
