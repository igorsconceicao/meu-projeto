"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Gauge, Loader2, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { criarClienteSupabaseNavegador } from "@/lib/supabase/browser";
import { papelDasClaims } from "@/lib/auth/papel";

const SUFIXO_DOMINIO = "@admin.local";

/** Só aceita voltar para uma página deste site (nada de "//outro-site.com"). */
function destinoSeguro(r: string | null): string {
  return r && /^\/(?![\/\\])/.test(r) ? r : "/";
}

export function FormularioEntrar() {
  const router = useRouter();
  const params = useSearchParams();
  const retorno = destinoSeguro(params.get("retorno"));
  const [usuario, setUsuario] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => criarClienteSupabaseNavegador(), []);

  async function entrar(ev: React.FormEvent) {
    ev.preventDefault();
    setCarregando(true);
    setErro(null);

    const nomeLimpo = usuario.trim().toLowerCase();
    if (!nomeLimpo) {
      setErro("Informe o nome de usuário.");
      setCarregando(false);
      return;
    }
    const emailInterno = `${nomeLimpo}${SUFIXO_DOMINIO}`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInterno,
      password: senha,
    });

    if (!error && !papelDasClaims(data.user)) {
      // Conta existe, mas o administrador ainda não liberou o acesso.
      await supabase.auth.signOut();
      setErro("Este usuário ainda não tem acesso liberado. Fale com o administrador.");
      setCarregando(false);
      return;
    }

    if (error) {
      setErro(
        error.message === "Invalid login credentials"
          ? "Usuário ou senha incorretos."
          : error.message,
      );
      setCarregando(false);
      return;
    }

    router.replace(retorno);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Inteligência Automotiva Brasil</CardTitle>
            <CardDescription className="flex items-center justify-center gap-1">
              <Lock className="h-3.5 w-3.5" /> Acesso restrito · entre com seu usuário
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {erro ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </div>
          ) : null}

          <form onSubmit={entrar} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="usuario"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Usuário
              </label>
              <div className="relative">
                <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="usuario"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  placeholder="Ex.: Igor"
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label
                htmlFor="senha"
                className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                Senha
              </label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando…
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
