import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { SeloVerificadoBr } from "@/components/midia/selo-verificado-br";
import { ResumoTecnicoCard } from "@/components/tecnico/resumo-card";
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
import { buscarVeiculos } from "@/lib/dados/veiculos";
import { formatarData, formatarPreco } from "@/lib/utils";

export const metadata = {
  title: "Veículos",
};

export const dynamic = "force-dynamic";

export default async function PaginaVeiculos() {
  const todos = await buscarVeiculos();
  const veiculos = todos.filter((v) => v.completude?.publicavel);
  const emVerificacao = todos.length - veiculos.length;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Catálogo de veículos"
        descricao="Somente modelos vendidos no Brasil e com o pacote mínimo completo: foto real da versão brasileira, fonte oficial brasileira, motor e câmbio, central multimídia (tela, CarPlay e Android Auto) e tipo de farol — cada dado com fonte e data."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {veiculos.length} modelo{veiculos.length === 1 ? "" : "s"} publicado{veiculos.length === 1 ? "" : "s"}
          {emVerificacao > 0 ? (
            <span className="text-muted-foreground/80">
              {" "}· {emVerificacao} em verificação (entram quando os dados mínimos forem confirmados)
            </span>
          ) : null}
        </p>
        <Input
          placeholder="Filtrar por marca ou modelo..."
          className="w-full sm:w-72"
          aria-label="Filtrar veículos"
        />
      </div>

      {veiculos.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhum veículo com o pacote mínimo completo ainda. Acompanhe as pendências no{" "}
          <Link className="font-medium text-primary hover:underline" href="/admin/veiculos">
            painel administrativo
          </Link>
          .
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {veiculos.map((v) => (
            <Card key={v.id} className="flex flex-col overflow-hidden">
              <Link href={`/veiculos/${v.slug}`} className="group block">
                <FotoVeiculo
                  nome={`${v.marca} ${v.nomeComercial}`}
                  categoria={v.categoria}
                  propulsao={v.propulsao}
                  fotoUrl={v.fotoPrincipalUrl}
                  montadoraSlug={v.montadoraSlug}
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
                      logotipoUrl={v.montadora?.logotipoUrl ?? null}
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
                        {v.geracao} · ano {v.anoModelo ?? "a confirmar"}
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
                <ResumoTecnicoCard tecnicos={v.tecnicos} />
                {v.dataLancamentoBr ? (
                  <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span>Lançamento BR</span>
                    <span className="font-medium text-foreground">
                      {formatarData(v.dataLancamentoBr)}
                    </span>
                  </div>
                ) : null}
                {v.precoReferencia ? (
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Preço de referência</span>
                    <span className="font-medium text-foreground">
                      {formatarPreco(v.precoReferencia)}
                    </span>
                  </div>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <SeloVerificadoBr url={v.verificadoBrUrl} em={v.verificadoBrEm} compacto />
                  <BadgeConfianca nivel={v.confianca} />
                </div>
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
      )}
    </div>
  );
}
