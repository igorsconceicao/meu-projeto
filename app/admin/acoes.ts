"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export async function acaoSair() {
  const supabase = await criarClienteSupabaseServidor();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ========== MONTADORAS ==========

function normalizarSlug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function salvarMontadora(id: string | null, dados: FormData) {
  const supabase = await criarClienteSupabaseServidor();
  const nome = String(dados.get("nome") ?? "").trim();
  if (!nome) throw new Error("Nome é obrigatório.");

  const slugEntrada = String(dados.get("slug") ?? "").trim();
  const slug = slugEntrada ? normalizarSlug(slugEntrada) : normalizarSlug(nome);

  const payload = {
    slug,
    nome,
    grupo: String(dados.get("grupo") ?? "").trim() || null,
    pais: String(dados.get("pais") ?? "").trim() || "A confirmar",
    destaque: String(dados.get("destaque") ?? "").trim() || null,
    logotipo_url: String(dados.get("logotipo_url") ?? "").trim() || null,
    logotipo_credito: String(dados.get("logotipo_credito") ?? "").trim() || null,
    site_oficial_url: String(dados.get("site_oficial_url") ?? "").trim() || null,
  };

  if (id) {
    const { error } = await supabase.from("montadoras").update(payload).eq("id", id);
    if (error) throw new Error(`Erro ao salvar: ${error.message}`);
  } else {
    const { error } = await supabase.from("montadoras").insert(payload);
    if (error) throw new Error(`Erro ao criar: ${error.message}`);
  }

  revalidatePath("/admin/montadoras");
  revalidatePath("/montadoras");
  revalidatePath("/");
  redirect("/admin/montadoras");
}

export async function excluirMontadora(id: string) {
  const supabase = await criarClienteSupabaseServidor();
  const { error } = await supabase.from("montadoras").delete().eq("id", id);
  if (error) throw new Error(`Erro ao excluir: ${error.message}`);
  revalidatePath("/admin/montadoras");
  revalidatePath("/montadoras");
  revalidatePath("/");
}

// ========== VEÍCULOS ==========

export async function salvarVeiculo(id: string | null, dados: FormData) {
  const supabase = await criarClienteSupabaseServidor();
  const nome = String(dados.get("nome_comercial") ?? "").trim();
  const marcaId = String(dados.get("montadora_id") ?? "").trim();
  if (!nome) throw new Error("Nome comercial é obrigatório.");
  if (!marcaId) throw new Error("Montadora é obrigatória.");

  const { data: montadora, error: errMont } = await supabase
    .from("montadoras")
    .select("slug")
    .eq("id", marcaId)
    .maybeSingle();
  if (errMont || !montadora) throw new Error("Montadora inválida.");

  const slugEntrada = String(dados.get("slug") ?? "").trim();
  const anoModelo = parseInt(String(dados.get("ano_modelo") ?? "0"), 10);
  const slug = slugEntrada
    ? normalizarSlug(slugEntrada)
    : normalizarSlug(`${montadora.slug}-${nome}-${anoModelo || ""}`);

  const payload: Record<string, unknown> = {
    slug,
    montadora_id: marcaId,
    nome_comercial: nome,
    geracao: String(dados.get("geracao") ?? "").trim() || "A confirmar",
    ano_modelo: anoModelo || null,
    data_lancamento_br: String(dados.get("data_lancamento_br") ?? "").trim() || null,
    categoria: String(dados.get("categoria") ?? "SUV"),
    propulsao: String(dados.get("propulsao") ?? "Flex"),
    situacao: String(dados.get("situacao") ?? "A confirmar"),
    confianca: String(dados.get("confianca") ?? "nao_confirmado"),
    resumo: String(dados.get("resumo") ?? "").trim() || null,
    foto_principal_url: String(dados.get("foto_principal_url") ?? "").trim() || null,
    foto_principal_credito: String(dados.get("foto_principal_credito") ?? "").trim() || null,
    link_oficial_url: String(dados.get("link_oficial_url") ?? "").trim() || null,
    video_oficial_url: String(dados.get("video_oficial_url") ?? "").trim() || null,
  };

  const galeriaBruta = String(dados.get("galeria_urls") ?? "").trim();
  const galeria = galeriaBruta
    ? galeriaBruta
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter(Boolean)
    : [];
  payload.galeria_urls = galeria;

  const preco = String(dados.get("preco_referencia") ?? "").trim();
  if (preco) payload.preco_referencia = Number(preco);

  if (id) {
    const { error } = await supabase.from("veiculos").update(payload).eq("id", id);
    if (error) throw new Error(`Erro ao salvar: ${error.message}`);
  } else {
    const { error } = await supabase.from("veiculos").insert(payload);
    if (error) throw new Error(`Erro ao criar: ${error.message}`);
  }

  revalidatePath("/admin/veiculos");
  revalidatePath("/veiculos");
  revalidatePath(`/veiculos/${slug}`);
  revalidatePath("/");
  redirect("/admin/veiculos");
}

export async function excluirVeiculo(id: string) {
  const supabase = await criarClienteSupabaseServidor();
  const { error } = await supabase.from("veiculos").delete().eq("id", id);
  if (error) throw new Error(`Erro ao excluir: ${error.message}`);
  revalidatePath("/admin/veiculos");
  revalidatePath("/veiculos");
  revalidatePath("/");
}
