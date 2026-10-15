import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Car, Gauge, Home, KeyRound, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import { acaoSair } from "./acoes";

export const dynamic = "force-dynamic";

const NAV_ADMIN = [
  { href: "/admin", titulo: "Visão geral", icone: Gauge },
  { href: "/admin/montadoras", titulo: "Montadoras", icone: Building2 },
  { href: "/admin/veiculos", titulo: "Veículos", icone: Car },
];

export default async function LayoutAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Permite /admin/login sem autenticação (middleware já cuida de redirect
  // para outras rotas; aqui só renderizamos sem a sidebar se não autenticado)
  if (!user) {
    return <>{children}</>;
  }

  // Nome de exibição: prefere `user_metadata.usuario`, cai para a parte antes
  // do @ no e-mail interno (ex: "igor@admin.local" → "igor" → "Igor").
  const metadata = user.user_metadata as { usuario?: string } | null;
  const nomeExibicao =
    metadata?.usuario ||
    (user.email?.split("@")[0]?.replace(/^./, (c) => c.toUpperCase()) ?? "Admin");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Painel administrativo
          </p>
          <p className="text-sm font-medium">Bem-vindo, {nomeExibicao}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Ir para o site público
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/trocar-senha">
              <KeyRound className="h-4 w-4" />
              Trocar senha
            </Link>
          </Button>
          <form action={acaoSair}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>
      </div>

      <nav className="flex flex-wrap gap-1 rounded-lg border bg-card p-1">
        {NAV_ADMIN.map(({ href, titulo, icone: Icone }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
          >
            <Icone className="h-4 w-4" />
            {titulo}
          </Link>
        ))}
      </nav>

      <Separator />

      {children}
    </div>
  );
}

// Garante que /admin/login redirecione para /admin se usuário já está logado
export async function usuarioJaLogado() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/admin");
}
