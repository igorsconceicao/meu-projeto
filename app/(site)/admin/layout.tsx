import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, Car, Gauge, Radar } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { sessaoAtual } from "@/lib/auth/sessao";

const NAV_ADMIN = [
  { href: "/admin", titulo: "Visão geral", icone: Gauge },
  { href: "/admin/montadoras", titulo: "Montadoras", icone: Building2 },
  { href: "/admin/veiculos", titulo: "Veículos", icone: Car },
  { href: "/admin/novidades", titulo: "Novidades detectadas", icone: Radar },
];

export default async function LayoutAdmin({ children }: { children: React.ReactNode }) {
  // Só administrador entra aqui (o proxy já barra; esta é a segunda tranca).
  const sessao = await sessaoAtual();
  if (sessao?.papel !== "admin") redirect("/");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Painel administrativo</p>
          <p className="text-sm font-medium">Bem-vindo, {sessao.nome}</p>
        </div>
        <nav className="flex flex-wrap gap-1 rounded-lg border bg-background p-1">
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
      </div>

      <Separator />

      {children}
    </div>
  );
}
