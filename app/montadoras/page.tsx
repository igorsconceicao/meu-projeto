import Link from "next/link";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { BotaoSiteOficial } from "@/components/midia/botao-site-oficial";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buscarMontadoras } from "@/lib/dados/montadoras";

export const metadata = {
  title: "Montadoras",
};

export const dynamic = "force-dynamic";

export default async function PaginaMontadoras() {
  const montadoras = await buscarMontadoras();

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Montadoras e marcas"
        descricao={`${montadoras.length} marcas monitoradas pela plataforma. Logotipos oficiais via Wikimedia Commons (crédito e licença CC exibidos abaixo). Marcas sem logotipo público conhecido exibem iniciais estilizadas na cor da marca.`}
      />

      {montadoras.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          Nenhuma montadora cadastrada ainda. Use o{" "}
          <Link className="font-medium text-primary hover:underline" href="/admin/montadoras">
            painel administrativo
          </Link>{" "}
          para adicionar.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {montadoras.map((m) => (
            <Card key={m.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <LogoMontadora
                      nome={m.nome}
                      slug={m.slug}
                      logotipoUrl={m.logotipoUrl}
                      logotipoCredito={m.logotipoCredito}
                      tamanho="lg"
                    />
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base leading-tight">
                        {m.nome}
                      </CardTitle>
                      {m.grupo ? (
                        <CardDescription className="truncate text-xs">
                          {m.grupo}
                        </CardDescription>
                      ) : null}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0">
                    {m.qtdModelos ?? 0} {(m.qtdModelos ?? 0) === 1 ? "modelo" : "modelos"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Origem</span>
                  <span className="font-medium text-foreground">{m.pais}</span>
                </div>
                {m.destaque ? (
                  <p className="rounded-md border border-dashed bg-muted/40 p-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Destaque:</span>{" "}
                    {m.destaque}
                  </p>
                ) : null}
                {m.logotipoCredito ? (
                  <p className="text-[10px] text-muted-foreground/80">
                    Logo: {m.logotipoCredito}
                  </p>
                ) : null}
              </CardContent>
              <CardFooter>
                <BotaoSiteOficial
                  url={m.siteOficialUrl}
                  marca={m.nome}
                  texto="Site oficial"
                  variant="outline"
                  size="sm"
                  className="w-full"
                />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
