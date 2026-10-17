import Link from "next/link";
import {
  Building2,
  Car,
  Database,
  Image as ImageIcon,
  PlusCircle,
  Radar,
  ShieldCheck,
} from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buscarMontadoras } from "@/lib/dados/montadoras";
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";

export const metadata = {
  title: "Administração",
};

export const dynamic = "force-dynamic";

export default async function PaginaAdmin() {
  const supabase = await criarClienteSupabaseServidor();
  const [montadoras, veiculos, { count: novidadesPendentes }] = await Promise.all([
    buscarMontadoras(),
    buscarVeiculos(),
    supabase.from("monitor_novidades").select("id", { count: "exact", head: true }).eq("status", "pendente"),
  ]);

  const veiculosComFoto = veiculos.filter((v) => v.fotoPrincipalUrl).length;
  const veiculosPublicados = veiculos.filter((v) => v.completude?.publicavel).length;
  const veiculosComLink = veiculos.filter((v) => v.linkOficialUrl).length;
  const montadorasComLogo = montadoras.filter((m) => m.logotipoUrl).length;

  const cartoes = [
    {
      titulo: "Montadoras",
      valor: montadoras.length,
      descricao: `${montadorasComLogo} com logotipo definido`,
      icone: Building2,
      href: "/admin/montadoras",
      acao: "Gerenciar",
    },
    {
      titulo: "Veículos",
      valor: veiculos.length,
      descricao: `${veiculosPublicados} publicados · ${veiculos.length - veiculosPublicados} em verificação · ${veiculosComFoto} com foto · ${veiculosComLink} com link oficial`,
      icone: Car,
      href: "/admin/veiculos",
      acao: "Gerenciar",
    },
    {
      titulo: "Novidades detectadas",
      valor: novidadesPendentes ?? 0,
      descricao: "Mudanças nos sites oficiais das marcas aguardando revisão (verificação toda segunda-feira)",
      icone: Radar,
      href: "/admin/novidades",
      acao: "Revisar",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Visão geral do admin"
        descricao="Catálogo armazenado no Supabase. Qualquer alteração aqui aparece no site em segundos."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cartoes.map((c) => (
          <Card key={c.titulo} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <c.icone className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{c.titulo}</CardTitle>
                    <CardDescription className="text-xs">
                      {c.descricao}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-base font-semibold">
                  {c.valor}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="mt-auto flex gap-2">
              <Button asChild className="flex-1">
                <Link href={c.href}>{c.acao}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`${c.href}/novo`}>
                  <PlusCircle className="h-4 w-4" />
                  Adicionar
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Database className="h-4 w-4" />
              Banco de dados
            </div>
            <CardTitle className="text-base">Supabase (sa-east-1)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Projeto <strong>inteligencia-automotiva</strong> hospedado em São
            Paulo. Row Level Security ativo: leitura pública, alterações só
            para usuários autenticados.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              Mídia
            </div>
            <CardTitle className="text-base">Imagens e links</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Logos via Clearbit Logo API com fallback automático. Fotos de
            veículos e vídeos oficiais ficam vazios até você preencher aqui ou
            até a coleta automática (Iteração 6).
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="h-4 w-4" />
              Segurança
            </div>
            <CardTitle className="text-base">Rastreabilidade</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Toda alteração aqui é gravada com usuário e timestamp. Nenhuma
            chave é exposta no frontend — apenas a publishable key, protegida
            por RLS.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
