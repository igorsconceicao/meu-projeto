"use server";

import { revalidatePath, updateTag } from "next/cache";
import { exigirSessao } from "@/lib/auth/sessao";
import { ETIQUETA_CATALOGO } from "@/lib/dados/catalogo";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

/** Marca uma novidade como resolvida (já tratada no catálogo) ou ignorada. */
export async function marcarNovidade(id: string, status: "pendente" | "resolvido" | "ignorado") {
  await exigirSessao("admin");
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente no painel.");

  const { error } = await supabase
    .from("monitor_novidades")
    .update({ status, resolvido_em: status === "pendente" ? null : new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Não foi possível atualizar: ${error.message}`);
  updateTag(ETIQUETA_CATALOGO);
  revalidatePath("/", "layout");
}
