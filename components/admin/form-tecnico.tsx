"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  excluirDadoTecnico,
  salvarDadoTecnico,
  type ResultadoTecnico,
} from "@/app/admin/tecnicos/acoes";
import {
  CAMPOS_TECNICOS,
  CONFIANCAS,
  ESTADOS,
  TABELAS_UNICAS,
  type TabelaTecnica,
} from "@/lib/admin-tecnicos";
import { cn } from "@/lib/utils";

export type ValoresTecnicos = Record<string, string | number | null>;

const CLASSE_CAMPO =
  "w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

const INICIAL: ResultadoTecnico = { erro: null };

/**
 * Formulário de um bloco de dados técnicos. `valores` nulo = item novo.
 * Todo bloco exige fonte (link), data de consulta e nível de confiança.
 */
export function FormTecnico({
  tabela,
  veiculoId,
  valores,
  fonteSugerida,
}: {
  tabela: TabelaTecnica;
  veiculoId: string;
  valores: ValoresTecnicos | null;
  fonteSugerida?: string | null;
}) {
  const acao = React.useMemo(() => salvarDadoTecnico.bind(null, tabela, veiculoId), [tabela, veiculoId]);
  const [estado, enviar, salvando] = React.useActionState(acao, INICIAL);
  const [excluindo, setExcluindo] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const unico = TABELAS_UNICAS.includes(tabela);
  const novo = valores === null;
  const v = (nome: string) => (valores?.[nome] ?? "") as string | number;

  // Item novo salvo: limpa o formulário para o próximo cadastro.
  React.useEffect(() => {
    if (estado.salvoEm && novo && !unico) formRef.current?.reset();
  }, [estado.salvoEm, novo, unico]);

  async function excluir() {
    const nome = unico ? "este bloco" : `“${v("posicao")}”`;
    if (!window.confirm(`Excluir ${nome}? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    const r = await excluirDadoTecnico(tabela, veiculoId, unico ? null : String(v("posicao")));
    setExcluindo(false);
    if (r.erro) alert(r.erro);
  }

  return (
    <form ref={formRef} action={enviar} className="space-y-4">
      {!unico && !novo ? <input type="hidden" name="posicao_original" value={String(v("posicao"))} /> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CAMPOS_TECNICOS[tabela].map((c) => (
          <label key={c.nome} className={cn("space-y-1 text-sm", c.tipo === "area" && "sm:col-span-2 lg:col-span-3")}>
            <span className="font-medium">
              {c.rotulo}
              {c.obrigatorio ? " *" : ""}
            </span>
            {c.tipo === "estado" ? (
              <select name={c.nome} defaultValue={String(v(c.nome) || "nao_identificado")} className={cn(CLASSE_CAMPO, "h-9")}>
                {ESTADOS.map((e) => (
                  <option key={e.valor} value={e.valor}>
                    {e.rotulo}
                  </option>
                ))}
              </select>
            ) : c.tipo === "area" ? (
              <textarea name={c.nome} rows={2} defaultValue={String(v(c.nome))} placeholder={c.dica} className={cn(CLASSE_CAMPO, "py-2")} />
            ) : (
              <Input
                name={c.nome}
                required={c.obrigatorio}
                inputMode={c.tipo === "numero" ? "decimal" : undefined}
                defaultValue={String(v(c.nome))}
                placeholder={c.dica}
              />
            )}
            {c.tipo === "estado" && c.dica ? <span className="block text-[11px] text-muted-foreground">{c.dica}</span> : null}
          </label>
        ))}
      </div>

      <fieldset className="grid gap-3 rounded-md border border-dashed p-3 sm:grid-cols-[2fr_1fr_1fr]">
        <legend className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Fonte do dado</legend>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Link da fonte *</span>
          <Input
            name="fonte_url"
            type="url"
            required
            defaultValue={String(v("fonte_url") || fonteSugerida || "")}
            placeholder="https://… (site oficial, manual do proprietário, catálogo)"
          />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Consultado em</span>
          <Input name="consultado_em" type="date" defaultValue={String(v("consultado_em") || new Date().toISOString().slice(0, 10))} />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-medium">Confiança</span>
          <select name="confianca" defaultValue={String(v("confianca") || "nao_confirmado")} className={cn(CLASSE_CAMPO, "h-9")}>
            {CONFIANCAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.rotulo}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm sm:col-span-3">
          <span className="font-medium">Evidência</span>
          <textarea
            name="evidencia"
            rows={2}
            defaultValue={String(v("evidencia"))}
            placeholder="Copie o trecho da fonte que comprova o dado"
            className={cn(CLASSE_CAMPO, "py-2")}
          />
        </label>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={salvando}>
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {novo && !unico ? "Adicionar" : "Salvar"}
        </Button>
        {!novo ? (
          <Button type="button" size="sm" variant="ghost" onClick={excluir} disabled={excluindo} className="text-destructive">
            {excluindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Excluir
          </Button>
        ) : null}
        {estado.erro ? <p className="text-sm text-destructive">{estado.erro}</p> : null}
        {!estado.erro && estado.salvoEm && !salvando ? (
          <p className="inline-flex items-center gap-1 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Salvo
          </p>
        ) : null}
      </div>
    </form>
  );
}
