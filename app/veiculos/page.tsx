import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MONTADORAS, VEICULOS } from "@/lib/dados-demo";
import { formatarData, formatarPreco } from "@/lib/utils";

export const metadata = {
  title: "Veículos",
};

export default function PaginaVeiculos() {
  const logoDe = (slug: string) =>
    MONTADORAS.find((m) => m.slug === slug)?.logotipoUrl ?? null;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Catálogo de veículos"
        descricao="Fichas técnicas de modelos lançados ou atualizados a partir de janeiro de 2025. Cada veículo contém multimídia, iluminação, palhetas, interruptores e códigos OEM, com fotos e links oficiais quando disponíveis."
      />

      <AlertaDemo />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {VEICULOS.length} registros · todos marcados como demonstração
        </p>
        <Input
          placeholder="Filtrar por marca ou modelo..."
          className="w-full sm:w-72"
          aria-label="Filtrar veículos"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VEICULOS.map((v) => (
          <Card key={v.slug} className="flex flex-col overflow-hidden">
            <Link href={`/veiculos/${v.slug}`} className="group block">
              <FotoVeiculo
                nome={`${v.marca} ${v.nomeComercial}`}
                categoria={v.categoria}
                propulsao={v.propulsao}
                fotoUrl={v.fotoPrincipalUrl ?? null}
                proporcao="16/9"
                className="rounded-none ring-0"
              />
            </Link>
            <CardHeader className="gap-2 pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <LogoMontadora
                    nome={v.marca}
                    slug={v.montadoraSlug}
                    logotipoUrl={logoDe(v.montadoraSlug)}
                    tamanho="md"
                  />
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {v.marca}
                    </p>
                    <CardTitle className="truncate text-base">
                      {v.nomeComercial}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {v.geracao} · ano {v.anoModelo}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {v.situacao}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 text-sm">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{v.categoria}</Badge>
                <Badge variant="secondary">{v.propulsao}</Badge>
              </div>
              <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                <span>Lançamento BR</span>
                <span className="font-medium text-foreground">
                  {formatarData(v.dataLancamentoBr)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Preço de referência</span>
                <span className="font-medium text-foreground">
                  {formatarPreco(v.precoReferencia)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
              <BadgeConfianca nivel={v.confianca} />
              <Link
                href={`/veiculos/${v.slug}`}
                className="inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
              >
                Abrir ficha
                <ChevronRight className="h-4 w-4" />
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
