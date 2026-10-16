"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Car, Cpu, Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Sugestoes = {
  montadoras: { slug: string; nome: string; logotipoUrl: string | null; modelos: number }[];
  veiculos: { slug: string; nome: string; marca: string; categoria: string; fotoUrl: string | null }[];
  componentes: { slug: string; veiculo: string; tipo: string; posicao: string; codigo: string }[];
  emVerificacao: number;
};

type Item = { href: string; rotulo: string; detalhe: string; icone: typeof Car; imagem?: string | null };

function itensDe(s: Sugestoes | null): Item[] {
  if (!s) return [];
  return [
    ...s.montadoras.map((m) => ({
      href: `/montadoras/${m.slug}`,
      rotulo: m.nome,
      detalhe: `Montadora · ${m.modelos} ${m.modelos === 1 ? "modelo" : "modelos"}`,
      icone: Building2,
      imagem: m.logotipoUrl,
    })),
    ...s.veiculos.map((v) => ({
      href: `/veiculos/${v.slug}`,
      rotulo: `${v.marca} ${v.nome}`,
      detalhe: `Veículo · ${v.categoria}`,
      icone: Car,
      imagem: v.fotoUrl,
    })),
    ...s.componentes.map((c) => ({
      href: `/veiculos/${c.slug}`,
      rotulo: c.codigo,
      detalhe: `${c.tipo} · ${c.posicao} · ${c.veiculo}`,
      icone: Cpu,
    })),
  ];
}

export function BuscaGlobal() {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [sugestoes, setSugestoes] = React.useState<Sugestoes | null>(null);
  const [carregando, setCarregando] = React.useState(false);
  const [aberto, setAberto] = React.useState(false);
  const [ativo, setAtivo] = React.useState(-1);
  const caixa = React.useRef<HTMLDivElement>(null);

  // Busca as sugestões 200 ms depois que a pessoa para de digitar.
  React.useEffect(() => {
    const termo = q.trim();
    if (termo.length < 2) return; // menos de 2 letras: a lista nem é exibida
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setCarregando(true);
      try {
        const res = await fetch(`/api/busca?q=${encodeURIComponent(termo)}`, { signal: ctrl.signal });
        if (res.ok) {
          setSugestoes(await res.json());
          setAtivo(-1);
        }
      } catch {
        /* busca cancelada */
      } finally {
        setCarregando(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  // Fecha ao clicar fora.
  React.useEffect(() => {
    const fechar = (e: MouseEvent) => {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    };
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, []);

  const itens = itensDe(sugestoes);

  const irPara = (href: string) => {
    setAberto(false);
    setQ("");
    router.push(href);
  };

  const aoEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (ativo >= 0 && itens[ativo]) return irPara(itens[ativo].href);
    if (q.trim()) irPara(`/busca?q=${encodeURIComponent(q.trim())}`);
  };

  const aoTeclar = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAberto(true);
      setAtivo((i) => Math.min(i + 1, itens.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtivo((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  };

  const mostrar = aberto && q.trim().length >= 2;

  return (
    <div ref={caixa} className="relative flex-1 max-w-xl">
      <form onSubmit={aoEnviar} role="search">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          onKeyDown={aoTeclar}
          placeholder="Buscar marca, modelo, motor, multimídia, código de lâmpada..."
          className="pl-9"
          aria-label="Busca global"
          aria-expanded={mostrar}
          aria-controls="sugestoes-busca"
          autoComplete="off"
        />
        {carregando ? (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </form>

      {mostrar ? (
        <div
          id="sugestoes-busca"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
        >
          {itens.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              {carregando || !sugestoes ? "Buscando..." : "Nada encontrado nos modelos publicados."}
            </p>
          ) : (
            <ul className="max-h-96 overflow-y-auto py-1">
              {itens.map((it, i) => (
                <li key={`${it.href}-${it.rotulo}-${i}`} role="option" aria-selected={i === ativo}>
                  <Link
                    href={it.href}
                    onClick={(e) => {
                      e.preventDefault();
                      irPara(it.href);
                    }}
                    onMouseEnter={() => setAtivo(i)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-sm",
                      i === ativo ? "bg-accent" : "hover:bg-accent",
                    )}
                  >
                    <span className="flex h-8 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                      {it.imagem ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imagem} alt="" className="h-full w-full object-contain" loading="lazy" />
                      ) : (
                        <it.icone className="h-4 w-4 text-muted-foreground" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{it.rotulo}</span>
                      <span className="block truncate text-xs text-muted-foreground">{it.detalhe}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => irPara(`/busca?q=${encodeURIComponent(q.trim())}`)}
            className="flex w-full items-center justify-between border-t px-3 py-2 text-left text-xs text-primary hover:bg-accent"
          >
            <span>Ver todos os resultados para “{q.trim()}”</span>
            <span className="text-muted-foreground">Enter</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
