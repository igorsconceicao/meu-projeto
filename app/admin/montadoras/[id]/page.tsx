import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FormMontadora } from "@/components/admin/form-montadora";
import { Button } from "@/components/ui/button";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { Montadora } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaEditarMontadora({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ehNovo = id === "novo";

  let montadora: Montadora | null = null;
  if (!ehNovo) {
    const supabase = await criarClienteSupabaseServidor();
    const { data } = await supabase.from("montadoras").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    montadora = {
      id: data.id,
      slug: data.slug,
      nome: data.nome,
      grupo: data.grupo,
      pais: data.pais,
      destaque: data.destaque,
      logotipoUrl: data.logotipo_url,
      logotipoCredito: data.logotipo_credito,
      siteOficialUrl: data.site_oficial_url,
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/admin/montadoras">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
      <CabecalhoPagina
        titulo={ehNovo ? "Nova montadora" : `Editar: ${montadora?.nome}`}
        descricao={
          ehNovo
            ? "Preencha os dados abaixo. O slug é gerado automaticamente a partir do nome."
            : "Edite os dados e clique em Salvar. Alterações aparecem no site público imediatamente."
        }
      />
      <FormMontadora montadora={montadora} />
    </div>
  );
}
