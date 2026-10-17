"use server";

import { revalidatePath } from "next/cache";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

/** Marca uma novidade como resolvida (já tratada no catálogo) ou ignorada. */
export async function marcarNovidade(id: string, status: "pendente" | "resolvido" | "ignorado") {
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
  revalidatePath("/admin/novidades");
  revalidatePath("/admin");
}
