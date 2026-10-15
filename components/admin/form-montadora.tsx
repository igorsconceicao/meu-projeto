"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { salvarMontadora } from "@/app/admin/acoes";
import type { Montadora } from "@/lib/tipos";

export function FormMontadora({ montadora }: { montadora: Montadora | null }) {
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [nome, setNome] = React.useState(montadora?.nome ?? "");
  const [slug, setSlug] = React.useState(montadora?.slug ?? "");
  const [logotipo, setLogotipo] = React.useState(montadora?.logotipoUrl ?? "");

  async function submeter(formData: FormData) {
    setCarregando(true);
    setErro(null);
    try {
      await salvarMontadora(montadora?.id ?? null, formData);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
      setCarregando(false);
    }
  }

  return (
    <form action={submeter} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {erro ? (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {erro}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Identificação</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Campo label="Nome *" obrigatorio>
              <Input
                name="nome"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Chevrolet"
              />
            </Campo>
            <Campo label="Slug" ajuda="Deixe vazio para gerar automaticamente do nome.">
              <Input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="chevrolet"
              />
            </Campo>
            <Campo label="Grupo">
              <Input
                name="grupo"
                defaultValue={montadora?.grupo ?? ""}
                placeholder="Ex.: Stellantis"
              />
            </Campo>
            <Campo label="País de origem *">
              <Input
                name="pais"
                required
                defaultValue={montadora?.pais ?? ""}
                placeholder="Ex.: Alemanha"
              />
            </Campo>
            <Campo label="Destaque / nota" className="sm:col-span-2">
              <Input
                name="destaque"
                defaultValue={montadora?.destaque ?? ""}
                placeholder="Ex.: Novo SUV elétrico em pré-venda"
              />
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Site e logo</CardTitle>
            <CardDescription>
              Links reais apenas. Deixe vazio para marcar como &ldquo;a confirmar&rdquo;.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Campo label="URL do site oficial">
              <Input
                name="site_oficial_url"
                type="url"
                defaultValue={montadora?.siteOficialUrl ?? ""}
                placeholder="https://www.chevrolet.com.br/"
              />
            </Campo>
            <Campo
              label="URL do logotipo"
              ajuda="Pode usar Clearbit: https://logo.clearbit.com/dominio.com — ou URL direta de arquivo SVG/PNG."
            >
              <Input
                name="logotipo_url"
                type="url"
                value={logotipo}
                onChange={(e) => setLogotipo(e.target.value)}
                placeholder="https://logo.clearbit.com/chevrolet.com"
              />
            </Campo>
            <Campo label="Crédito do logotipo">
              <Input
                name="logotipo_credito"
                defaultValue={montadora?.logotipoCredito ?? ""}
                placeholder="Ex.: Clearbit Logo API, Wikimedia Commons, upload próprio"
              />
            </Campo>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prévia</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-3 pb-6">
            <LogoMontadora
              nome={nome || "Nova marca"}
              slug={slug || nome.toLowerCase() || "nova"}
              logotipoUrl={logotipo || null}
              tamanho="xl"
            />
            <div className="text-center">
              <p className="font-semibold">{nome || "(sem nome)"}</p>
              <p className="text-xs text-muted-foreground">
                {logotipo ? "URL definida" : "sem logo — fallback com iniciais"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/admin/montadoras">Cancelar</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}

function Campo({
  label,
  children,
  ajuda,
  obrigatorio,
  className,
}: {
  label: string;
  children: React.ReactNode;
  ajuda?: string;
  obrigatorio?: boolean;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label} {obrigatorio ? null : null}
      </label>
      {children}
      {ajuda ? <p className="text-[11px] text-muted-foreground">{ajuda}</p> : null}
    </div>
  );
}
