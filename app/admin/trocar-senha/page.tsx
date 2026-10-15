"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Save } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { criarClienteSupabaseNavegador } from "@/lib/supabase/browser";

const MIN_LEN = 6;

export default function PaginaTrocarSenha() {
  const router = useRouter();
  const [atual, setAtual] = React.useState("");
  const [nova, setNova] = React.useState("");
  const [confirmar, setConfirmar] = React.useState("");
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [sucesso, setSucesso] = React.useState(false);

  const supabase = React.useMemo(() => criarClienteSupabaseNavegador(), []);

  async function submeter(ev: React.FormEvent) {
    ev.preventDefault();
    setErro(null);
    setSucesso(false);

    if (nova.length < MIN_LEN) {
      setErro(`A nova senha precisa ter pelo menos ${MIN_LEN} caracteres.`);
      return;
    }
    if (nova !== confirmar) {
      setErro("A confirmação não bate com a nova senha.");
      return;
    }
    if (nova === atual) {
      setErro("A nova senha precisa ser diferente da atual.");
      return;
    }

    setCarregando(true);

    // Reautentica com a senha atual antes de trocar
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setErro("Sessão expirada. Faça login novamente.");
      setCarregando(false);
      return;
    }

    const { error: errReauth } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: atual,
    });
    if (errReauth) {
      setErro("Senha atual incorreta.");
      setCarregando(false);
      return;
    }

    const { error: errUpdate } = await supabase.auth.updateUser({
      password: nova,
    });
    if (errUpdate) {
      setErro(`Não foi possível trocar: ${errUpdate.message}`);
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setAtual("");
    setNova("");
    setConfirmar("");
    setCarregando(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao admin
        </Link>
      </Button>

      <CabecalhoPagina
        titulo="Trocar senha"
        descricao="Escolha uma senha pessoal com pelo menos 6 caracteres. Guarde em algum lugar seguro — não há recuperação automática por e-mail."
      />

      <div className="mx-auto w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <KeyRound className="h-5 w-5" />
              </div>
              <CardTitle className="text-base">Nova senha</CardTitle>
            </div>
          </CardHeader>
          <form onSubmit={submeter}>
            <CardContent className="space-y-4">
              {sucesso ? (
                <div className="flex items-start gap-2 rounded-md border border-success/50 bg-success/10 p-3 text-sm text-success">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p className="font-medium">Senha trocada com sucesso!</p>
                    <p className="text-xs text-success/80">
                      No próximo login use a nova senha.
                    </p>
                  </div>
                </div>
              ) : null}

              {erro ? (
                <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {erro}
                </div>
              ) : null}

              <div className="space-y-1">
                <label
                  htmlFor="atual"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Senha atual
                </label>
                <Input
                  id="atual"
                  type="password"
                  autoComplete="current-password"
                  value={atual}
                  onChange={(e) => setAtual(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="nova"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Nova senha
                </label>
                <Input
                  id="nova"
                  type="password"
                  autoComplete="new-password"
                  value={nova}
                  onChange={(e) => setNova(e.target.value)}
                  minLength={MIN_LEN}
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Mínimo {MIN_LEN} caracteres.
                </p>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="confirmar"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Confirmar nova senha
                </label>
                <Input
                  id="confirmar"
                  type="password"
                  autoComplete="new-password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  minLength={MIN_LEN}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar nova senha
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" size="sm" asChild className="w-full">
                <Link href="/admin">Cancelar</Link>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
