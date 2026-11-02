"use server";

import { redirect } from "next/navigation";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export async function acaoSair() {
  const supabase = await criarClienteSupabaseServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}
