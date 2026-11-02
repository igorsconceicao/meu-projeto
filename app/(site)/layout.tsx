import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PreviaVeiculoGlobal } from "@/components/catalogo/previa-veiculo";
import { sessaoAtual } from "@/lib/auth/sessao";

export default async function LayoutSite({ children }: { children: React.ReactNode }) {
  // O proxy já barra quem não entrou; esta conferência é a segunda tranca.
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/entrar");
  const admin = sessao.papel === "admin";

  return (
    <>
      <div className="flex min-h-screen">
        <Sidebar className="sticky top-0 hidden h-screen md:flex" admin={admin} />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Header nome={sessao.nome} admin={admin} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
          <footer className="border-t px-4 py-4 text-center text-xs text-muted-foreground md:px-8">
            Uso interno · cada dado tem fonte, data de consulta e tipo de fonte indicados
          </footer>
        </div>
      </div>
      <PreviaVeiculoGlobal />
    </>
  );
}
