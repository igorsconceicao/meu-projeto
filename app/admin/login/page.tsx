"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Gauge, Loader2, Mail } from "lucide-react";
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

export default function PaginaLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const retorno = params.get("retorno") ?? "/admin";
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [modo, setModo] = React.useState<"senha" | "magic">("senha");
  const [carregando, setCarregando] = React.useState(false);
  const [mensagem, setMensagem] = React.useState<string | null>(null);
  const [erro, setErro] = React.useState<string | null>(null);

  const supabase = React.useMemo(() => criarClienteSupabaseNavegador(), []);

  async function entrarComSenha(ev: React.FormEvent) {
    ev.preventDefault();
    setCarregando(true);
    setErro(null);
    setMensagem(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(error.message === "Invalid login credentials"
        ? "E-mail ou senha incorretos."
        : error.message);
      setCarregando(false);
      return;
    }
    router.push(retorno);
    router.refresh();
  }

  async function enviarMagicLink(ev: React.FormEvent) {
    ev.preventDefault();
    setCarregando(true);
    setErro(null);
    setMensagem(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/admin`
            : undefined,
      },
    });
    if (error) {
      setErro(error.message);
    } else {
      setMensagem(
        `Enviamos um link mágico para ${email}. Abra seu e-mail e clique no link para entrar.`,
      );
    }
    setCarregando(false);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Gauge className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">Painel administrativo</CardTitle>
            <CardDescription>
              Inteligência Automotiva Brasil
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mensagem ? (
            <div className="rounded-md border border-success/50 bg-success/10 p-3 text-sm text-success">
              {mensagem}
            </div>
          ) : null}
          {erro ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {erro}
            </div>
          ) : null}

          <form
            onSubmit={modo === "senha" ? entrarComSenha : enviarMagicLink}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                E-mail
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="voce@suaempresa.com"
              />
            </div>
            {modo === "senha" ? (
              <div className="space-y-1">
                <label htmlFor="senha" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Senha
                </label>
                <Input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando…
                </>
              ) : modo === "senha" ? (
                "Entrar"
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Enviar link mágico
                </>
              )}
            </Button>
          </form>

          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-card px-2 relative z-10">ou</span>
            <span className="absolute left-0 right-0 top-1/2 -z-0 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              setErro(null);
              setMensagem(null);
              setModo(modo === "senha" ? "magic" : "senha");
            }}
          >
            {modo === "senha"
              ? "Entrar por link mágico (sem senha)"
              : "Voltar para entrar com senha"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Primeira vez? Peça para o administrador criar sua conta no{" "}
            <a
              href="https://supabase.com/dashboard/project/npmsgjpjfflawluyuisl/auth/users"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              painel Supabase
            </a>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
