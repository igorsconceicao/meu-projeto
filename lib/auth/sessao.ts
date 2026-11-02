import { cache } from "react";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import { papelDasClaims, type Papel } from "@/lib/auth/papel";

export type Sessao = { nome: string; papel: Papel };

/**
 * Quem está usando o site nesta requisição. A assinatura do token é conferida
 * localmente (chave ES256 publicada pelo Supabase), sem ida ao servidor.
 * Retorna null para visitante sem login ou conta sem acesso liberado.
 */
export const sessaoAtual = cache(async function sessaoAtual(): Promise<Sessao | null> {
  const supabase = await criarClienteSupabaseServidor();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const papel = papelDasClaims(claims);
  if (!claims || !papel) return null;
  const usuario = (claims.user_metadata as { usuario?: string } | undefined)?.usuario;
  const local = typeof claims.email === "string" ? claims.email.split("@")[0] : "";
  const nome = usuario || (local ? local.charAt(0).toUpperCase() + local.slice(1) : "Usuário");
  return { nome, papel };
});

/** Barreira extra nas funções que entregam dados: sem sessão válida, nada sai. */
export async function exigirSessao(papel: Papel = "leitor"): Promise<Sessao> {
  const s = await sessaoAtual();
  if (!s || (papel === "admin" && s.papel !== "admin")) {
    throw new Error("Acesso negado: entre com um usuário autorizado.");
  }
  return s;
}
