import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Eye, Pencil, PlusCircle } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FormTecnico, type ValoresTecnicos } from "@/components/admin/form-tecnico";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TABELAS_UNICAS, TITULOS_TABELA, type TabelaTecnica } from "@/lib/admin-tecnicos";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { ItemChecklist } from "@/lib/tipos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dados técnicos" };

const ORDEM: TabelaTecnica[] = ["fichas_tecnicas", "multimidias", "iluminacao", "palhetas", "interruptores_vidro"];

const DESCRICOES: Record<TabelaTecnica, string> = {
  fichas_tecnicas: "Motor, potência, câmbio e, nos elétricos, bateria e autonomia. Use a versão mais vendida como referência.",
  multimidias:
    "Estado de cada recurso conforme a fonte. Se a fonte não diz se é com ou sem fio, deixe “Não identificado” — nunca presuma.",
  iluminacao: "Uma linha por posição (farol principal, luz diurna, lanterna…). Códigos e OEM só com fonte (manual ou catálogo).",
  palhetas: "Medidas e encaixe por posição, conforme manual do proprietário ou catálogo do fabricante.",
  interruptores_vidro: "Interruptores dos vidros elétricos por porta, com OEM e conector quando houver fonte.",
};

export default async function PaginaDadosTecnicos({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const veiculos = await buscarVeiculos();
  const veiculo = veiculos.find((v) => v.id === id);
  if (!veiculo) notFound();

  const supabase = await criarClienteSupabaseServidor();
  const linhas = await Promise.all(
    ORDEM.map(async (t) => {
      const q = supabase.from(t).select("*").eq("veiculo_id", id);
      const { data, error } = await (TABELAS_UNICAS.includes(t) ? q : q.order("posicao"));
      if (error) throw error;
      return [t, (data ?? []) as ValoresTecnicos[]] as const;
    }),
  );
  const porTabela = new Map(linhas);
  const c = veiculo.completude;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" size="sm" asChild className="self-start">
        <Link href="/admin/veiculos">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </Button>

      <CabecalhoPagina
        titulo={`Dados técnicos: ${veiculo.marca} ${veiculo.nomeComercial}`}
        descricao="Cada bloco é gravado com o link da fonte, a data da consulta e o nível de confiança. Quando faltar informação, deixe o campo vazio: ele aparece no site como pendência, nunca como dado inventado."
        acoes={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/veiculos/${id}`}>
                <Pencil className="h-4 w-4" />
                Dados básicos e fotos
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/veiculos/${veiculo.slug}`}>
                <Eye className="h-4 w-4" />
                Ver ficha
              </Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base">Situação de publicação</CardTitle>
            {c?.publicavel ? <Badge variant="success">Publicado no site</Badge> : <Badge variant="warning">Em verificação</Badge>}
          </div>
          <CardDescription>
            O modelo aparece no site quando todos os itens obrigatórios estão preenchidos. Os complementares aparecem como pendências na ficha.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Checklist titulo="Obrigatórios" itens={c?.obrigatorios ?? []} />
          <Checklist titulo="Complementares" itens={c?.complementares ?? []} />
        </CardContent>
      </Card>

      {ORDEM.map((t) => {
        const itens = porTabela.get(t) ?? [];
        const unico = TABELAS_UNICAS.includes(t);
        return (
          <Card key={t} id={t} className="scroll-mt-20">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{TITULOS_TABELA[t]}</CardTitle>
                {unico ? (
                  itens.length ? <Badge variant="secondary">Preenchido</Badge> : <Badge variant="outline">Vazio</Badge>
                ) : (
                  <Badge variant="secondary">{itens.length} ite{itens.length === 1 ? "m" : "ns"}</Badge>
                )}
              </div>
              <CardDescription>{DESCRICOES[t]}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {unico ? (
                <FormTecnico tabela={t} veiculoId={id} valores={itens[0] ?? null} fonteSugerida={veiculo.linkOficialUrl} />
              ) : (
                <>
                  {itens.map((item) => (
                    <details key={`${t}-${item.posicao}`} className="group rounded-md border p-3">
                      <summary className="cursor-pointer list-none text-sm font-medium">
                        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                        {String(item.posicao)}
                        <span className="ml-2 font-normal text-muted-foreground">
                          {[item.tecnologia, item.codigo, item.medida_mm ? `${item.medida_mm} mm` : null, item.tipo, item.oem ? `OEM ${item.oem}` : null]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </summary>
                      <div className="mt-3">
                        <FormTecnico tabela={t} veiculoId={id} valores={item} />
                      </div>
                    </details>
                  ))}
                  <details className="group rounded-md border border-dashed p-3" open={itens.length === 0}>
                    <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-primary">
                      <PlusCircle className="h-4 w-4" />
                      Adicionar item
                    </summary>
                    <div className="mt-3">
                      <FormTecnico tabela={t} veiculoId={id} valores={null} fonteSugerida={veiculo.linkOficialUrl} />
                    </div>
                  </details>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function Checklist({ titulo, itens }: { titulo: string; itens: ItemChecklist[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{titulo}</p>
      <ul className="space-y-1 text-sm">
        {itens.map((i) => (
          <li key={i.chave} className="flex items-center gap-2">
            {i.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
            <span className={i.ok ? "" : "text-muted-foreground"}>{i.rotulo}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
