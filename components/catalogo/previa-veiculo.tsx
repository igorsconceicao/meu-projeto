"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { Layers, MonitorSmartphone, Wind } from "lucide-react";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import type { EstadoConectividade } from "@/lib/tipos";

type Projecao = { geral: EstadoConectividade; cabo: EstadoConectividade; semFio: EstadoConectividade };

type Previa = {
  slug: string;
  nome: string;
  marca: string;
  categoria: string;
  propulsao: string;
  fotoUrl: string | null;
  versoes: string[];
  tela: string | null;
  carplay: Projecao;
  androidAuto: Projecao;
  palhetas: { dianteira: string | null; traseira: string | null };
  motor: string | null;
};

const LARGURA = 320;
const ATRASO_MS = 350;
const ROTA = /^\/veiculos\/([a-z0-9-]+)\/?$/;

// Uma busca por veículo durante a visita: passar o mouse de novo abre na hora.
const cache = new Map<string, Promise<Previa | null>>();
function carregar(slug: string) {
  let p = cache.get(slug);
  if (!p) {
    p = fetch(`/api/veiculos/previa?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? (r.json() as Promise<Previa>) : null))
      .catch(() => null);
    cache.set(slug, p);
  }
  return p;
}

function slugDoLink(a: HTMLAnchorElement): string | null {
  if (a.dataset.semPrevia !== undefined) return null;
  try {
    const u = new URL(a.href);
    if (u.origin !== window.location.origin) return null;
    return u.pathname.match(ROTA)?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Janelinha de prévia: em qualquer página, ao parar o mouse sobre um link para a
 * ficha de um veículo, mostra foto, versões, CarPlay/Android Auto e palhetas.
 * Só em computador (dispositivos com mouse); no celular o toque abre a ficha.
 */
export function PreviaVeiculoGlobal() {
  const [estado, setEstado] = React.useState<{ dados: Previa | null; slug: string; ret: DOMRect } | null>(null);
  const atual = React.useRef<{ a: HTMLAnchorElement; slug: string } | null>(null);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const fechar = () => {
      window.clearTimeout(timer.current);
      atual.current = null;
      setEstado(null);
    };

    const aoEntrar = (e: PointerEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a === atual.current?.a) return;
      const slug = slugDoLink(a);
      if (!slug || window.location.pathname === `/veiculos/${slug}`) return;
      window.clearTimeout(timer.current);
      atual.current = { a, slug };
      timer.current = window.setTimeout(async () => {
        if (atual.current?.a !== a) return;
        setEstado({ dados: null, slug, ret: a.getBoundingClientRect() });
        const dados = await carregar(slug);
        if (atual.current?.a !== a) return;
        if (!dados) return fechar();
        setEstado({ dados, slug, ret: a.getBoundingClientRect() });
      }, ATRASO_MS);
    };

    const aoSair = (e: PointerEvent) => {
      const a = atual.current?.a;
      if (!a) return;
      const destino = e.relatedTarget as Node | null;
      if (destino && a.contains(destino)) return;
      if ((e.target as Element | null)?.closest?.("a[href]") === a) fechar();
    };

    document.addEventListener("pointerover", aoEntrar);
    document.addEventListener("pointerout", aoSair);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("blur", fechar);
    document.addEventListener("pointerdown", fechar);
    return () => {
      document.removeEventListener("pointerover", aoEntrar);
      document.removeEventListener("pointerout", aoSair);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("blur", fechar);
      document.removeEventListener("pointerdown", fechar);
      window.clearTimeout(timer.current);
    };
  }, []);

  if (!estado) return null;

  // Abre abaixo do link; se não couber, acima. Nunca sai da tela pelos lados.
  const { ret } = estado;
  const altura = estado.dados ? 380 : 90;
  const esquerda = Math.max(8, Math.min(ret.left, window.innerWidth - LARGURA - 8));
  const cabeAbaixo = ret.bottom + 8 + altura < window.innerHeight;
  const topo = cabeAbaixo ? ret.bottom + 8 : Math.max(8, ret.top - 8 - altura);

  return createPortal(
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[60] overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95"
      style={{ left: esquerda, top: topo, width: LARGURA }}
    >
      {estado.dados ? <Conteudo p={estado.dados} /> : <p className="p-4 text-sm text-muted-foreground">Carregando…</p>}
    </div>,
    document.body,
  );
}

const ROTULO: Record<EstadoConectividade, string> = {
  confirmado: "Sim",
  depende_versao: "Algumas versões",
  nao_disponivel: "Não",
  nao_identificado: "Sem info",
};

function textoProjecao(p: Projecao): string {
  if (p.geral === "nao_identificado" || p.geral === "nao_disponivel") return ROTULO[p.geral];
  const formas = [
    p.cabo === "confirmado" || p.cabo === "depende_versao" ? "cabo" : null,
    p.semFio === "confirmado" || p.semFio === "depende_versao" ? "sem fio" : null,
  ].filter(Boolean);
  return `${ROTULO[p.geral]}${formas.length ? ` · ${formas.join(" e ")}` : ""}`;
}

function cor(e: EstadoConectividade) {
  if (e === "confirmado") return "text-success";
  if (e === "depende_versao") return "text-warning";
  return "text-muted-foreground";
}

function Conteudo({ p }: { p: Previa }) {
  const mostrar = p.versoes.slice(0, 8);
  return (
    <div>
      <FotoVeiculo
        nome={`${p.marca} ${p.nome}`}
        categoria={p.categoria}
        propulsao={p.propulsao}
        fotoUrl={p.fotoUrl}
        proporcao="16/9"
        className="rounded-none"
        mostrarAviso={false}
      />
      <div className="space-y-3 p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {p.marca} · {p.categoria}
          </p>
          <p className="text-base font-semibold leading-tight">{p.nome}</p>
          {p.motor ? <p className="text-xs text-muted-foreground">{p.motor}</p> : null}
        </div>

        {p.versoes.length ? (
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs font-medium">
              <Layers className="h-3.5 w-3.5 text-primary" />
              {p.versoes.length === 1 ? "Versão única" : `${p.versoes.length} versões`}
            </p>
            <div className="flex flex-wrap gap-1">
              {mostrar.map((v) => (
                <span key={v} className="rounded border px-1.5 py-px text-[11px]">
                  {v}
                </span>
              ))}
              {p.versoes.length > mostrar.length ? (
                <span className="text-[11px] text-muted-foreground">+{p.versoes.length - mostrar.length}</span>
              ) : null}
            </div>
          </div>
        ) : null}

        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <dt className="flex items-center gap-1 text-muted-foreground">
            <MonitorSmartphone className="h-3.5 w-3.5" /> CarPlay
          </dt>
          <dd className={`font-medium ${cor(p.carplay.geral)}`}>{textoProjecao(p.carplay)}</dd>
          <dt className="pl-[18px] text-muted-foreground">Android Auto</dt>
          <dd className={`font-medium ${cor(p.androidAuto.geral)}`}>{textoProjecao(p.androidAuto)}</dd>
          {p.tela ? (
            <>
              <dt className="pl-[18px] text-muted-foreground">Tela</dt>
              <dd>{p.tela}</dd>
            </>
          ) : null}
          <dt className="flex items-center gap-1 text-muted-foreground">
            <Wind className="h-3.5 w-3.5" /> Palhetas
          </dt>
          <dd>
            {p.palhetas.dianteira || p.palhetas.traseira ? (
              <>
                {p.palhetas.dianteira ? <span className="block">Dianteira: {p.palhetas.dianteira}</span> : null}
                {p.palhetas.traseira ? <span className="block">Traseira: {p.palhetas.traseira}</span> : null}
              </>
            ) : (
              <span className="text-muted-foreground">Sem info</span>
            )}
          </dd>
        </dl>
        <p className="border-t pt-2 text-[11px] text-muted-foreground">Clique para abrir a ficha completa</p>
      </div>
    </div>
  );
}
