import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Wrench } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FormVeiculo } from "@/components/admin/form-veiculo";
import { Button } from "@/components/ui/button";
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { Veiculo } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export default async function PaginaEditarVeiculo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ehNovo = id === "novo";

  const montadoras = await buscarMontadoras();

  let veiculo: Partial<Veiculo> | null = null;
  if (!ehNovo) {
    const supabase = await criarClienteSupabaseServidor();
    const { data } = await supabase.from("veiculos").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    veiculo = {
      id: data.id,
      slug: data.slug,
      montadoraId: data.montadora_id,
      nomeComercial: data.nome_comercial,
      geracao: data.geracao,
      anoModelo: data.ano_modelo,
      dataLancamentoBr: data.data_lancamento_br,
      categoria: data.categoria,
      propulsao: data.propulsao,
      precoReferencia: data.preco_referencia ? Number(data.preco_referencia) : null,
      situacao: data.situacao,
      confianca: data.confianca,
      resumo: data.resumo,
      fotoPrincipalUrl: data.foto_principal_url,
      fotoPrincipalCredito: data.foto_principal_credito,
      linkOficialUrl: data.link_oficial_url,
      videoOficialUrl: data.video_oficial_url,
    };
  }

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/admin/veiculos">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>
      <CabecalhoPagina
        titulo={ehNovo ? "Novo veículo" : `Editar: ${veiculo?.nomeComercial}`}
        descricao={
          ehNovo
            ? "Campos obrigatórios: montadora, nome comercial, categoria, propulsão, ano-modelo."
            : "Edite os dados abaixo. Alterações aparecem no site público imediatamente."
        }
        acoes={
          ehNovo ? undefined : (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/veiculos/${id}/tecnicos`}>
                <Wrench className="h-4 w-4" />
                Dados técnicos
              </Link>
            </Button>
          )
        }
      />
      <FormVeiculo veiculo={veiculo} montadoras={montadoras} />
    </div>
  );
}
