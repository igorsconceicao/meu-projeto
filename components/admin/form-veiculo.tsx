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
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { salvarVeiculo } from "@/app/admin/acoes";
import type {
  CategoriaVeiculo,
  Montadora,
  SituacaoVeiculo,
  TipoPropulsao,
  Veiculo,
} from "@/lib/tipos";

const CATEGORIAS: CategoriaVeiculo[] = [
  "Hatch",
  "Sedã",
  "SUV",
  "Picape",
  "Utilitário",
  "Esportivo",
  "Minivan",
  "Coupé",
];

const PROPULSOES: TipoPropulsao[] = [
  "Combustão",
  "Flex",
  "Híbrido",
  "Híbrido Plug-in",
  "Elétrico",
];

const SITUACOES: SituacaoVeiculo[] = [
  "Lançado",
  "Pré-venda",
  "Atualizado",
  "A confirmar",
  "Descontinuado",
];

export function FormVeiculo({
  veiculo,
  montadoras,
}: {
  veiculo: Partial<Veiculo> | null;
  montadoras: Montadora[];
}) {
  const [carregando, setCarregando] = React.useState(false);
  const [erro, setErro] = React.useState<string | null>(null);
  const [nome, setNome] = React.useState(veiculo?.nomeComercial ?? "");
  const [categoria, setCategoria] = React.useState<CategoriaVeiculo>(
    veiculo?.categoria ?? "SUV",
  );
  const [propulsao, setPropulsao] = React.useState<TipoPropulsao>(
    veiculo?.propulsao ?? "Flex",
  );
  const [foto, setFoto] = React.useState(veiculo?.fotoPrincipalUrl ?? "");
  const [montadoraId, setMontadoraId] = React.useState(
    veiculo?.montadoraId ?? "",
  );

  async function submeter(formData: FormData) {
    setCarregando(true);
    setErro(null);
    try {
      await salvarVeiculo(veiculo?.id ?? null, formData);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao salvar.");
      setCarregando(false);
    }
  }

  const marcaDoVeiculo =
    montadoras.find((m) => m.id === montadoraId)?.nome ?? "Marca";

  return (
    <form action={submeter} className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
            <Campo label="Montadora *" className="sm:col-span-2">
              <select
                name="montadora_id"
                required
                value={montadoraId}
                onChange={(e) => setMontadoraId(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Selecione...</option>
                {montadoras.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Nome comercial *">
              <Input
                name="nome_comercial"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Equinox EV"
              />
            </Campo>
            <Campo label="Slug" ajuda="Deixe vazio para gerar automaticamente.">
              <Input
                name="slug"
                defaultValue={veiculo?.slug ?? ""}
                placeholder="chevrolet-equinox-ev-2025"
              />
            </Campo>
            <Campo label="Geração">
              <Input
                name="geracao"
                defaultValue={veiculo?.geracao ?? ""}
                placeholder="Ex.: 3ª geração, Reestilização, etc."
              />
            </Campo>
            <Campo label="Ano-modelo *">
              <Input
                name="ano_modelo"
                type="number"
                required
                min={2000}
                max={2035}
                defaultValue={veiculo?.anoModelo ?? new Date().getFullYear()}
              />
            </Campo>
            <Campo label="Categoria *">
              <select
                name="categoria"
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaVeiculo)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Campo>
            <Campo label="Propulsão *">
              <select
                name="propulsao"
                required
                value={propulsao}
                onChange={(e) => setPropulsao(e.target.value as TipoPropulsao)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {PROPULSOES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Campo>
            <Campo label="Situação comercial">
              <select
                name="situacao"
                defaultValue={veiculo?.situacao ?? "A confirmar"}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {SITUACOES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Campo>
            <Campo label="Confiança técnica">
              <select
                name="confianca"
                defaultValue={veiculo?.confianca ?? "nao_confirmado"}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                <option value="confirmado">Confirmado</option>
                <option value="bem_fundamentado">Bem fundamentado</option>
                <option value="nao_confirmado">A confirmar</option>
              </select>
            </Campo>
            <Campo label="Data de lançamento no Brasil">
              <Input
                name="data_lancamento_br"
                type="date"
                defaultValue={veiculo?.dataLancamentoBr ?? ""}
              />
            </Campo>
            <Campo label="Preço de referência (R$)">
              <Input
                name="preco_referencia"
                type="number"
                step="0.01"
                defaultValue={veiculo?.precoReferencia ?? ""}
                placeholder="Opcional"
              />
            </Campo>
            <Campo label="Resumo" className="sm:col-span-2">
              <textarea
                name="resumo"
                rows={3}
                defaultValue={veiculo?.resumo ?? ""}
                placeholder="Resumo curto do modelo (máx. 2-3 frases)."
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mídia e links oficiais</CardTitle>
            <CardDescription>
              Nunca invente URLs. Deixe vazio quando não houver fonte confiável.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Campo label="URL da foto principal">
              <Input
                name="foto_principal_url"
                type="url"
                value={foto}
                onChange={(e) => setFoto(e.target.value)}
                placeholder="https://..."
              />
            </Campo>
            <Campo
              label="Crédito da foto"
              ajuda="Para Wikimedia Commons use: &ldquo;Foto: NomeAutor / Wikimedia Commons (CC BY-SA 4.0)&rdquo;"
            >
              <Input
                name="foto_principal_credito"
                defaultValue={veiculo?.fotoPrincipalCredito ?? ""}
                placeholder="Ex.: Chevrolet Brasil (release de imprensa)"
              />
            </Campo>
            <Campo label="URL da página oficial do modelo">
              <Input
                name="link_oficial_url"
                type="url"
                defaultValue={veiculo?.linkOficialUrl ?? ""}
                placeholder="https://www.chevrolet.com.br/carros/equinox-ev"
              />
            </Campo>
            <Campo label="URL do vídeo oficial (YouTube ou Vimeo)">
              <Input
                name="video_oficial_url"
                type="url"
                defaultValue={veiculo?.videoOficialUrl ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
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
          <CardContent className="space-y-3">
            <FotoVeiculo
              nome={`${marcaDoVeiculo} ${nome || "(sem nome)"}`}
              categoria={categoria}
              propulsao={propulsao}
              fotoUrl={foto || null}
              proporcao="16/9"
              mostrarAviso={!foto}
            />
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {marcaDoVeiculo}
              </p>
              <p className="font-semibold">{nome || "(sem nome)"}</p>
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
              <Link href="/admin/veiculos">Cancelar</Link>
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
  className,
}: {
  label: string;
  children: React.ReactNode;
  ajuda?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      {children}
      {ajuda ? <p className="text-[11px] text-muted-foreground">{ajuda}</p> : null}
    </div>
  );
}
