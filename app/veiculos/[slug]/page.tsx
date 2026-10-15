import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, Calendar, Car, ExternalLink, Zap } from "lucide-react";
import { BotaoSiteOficial } from "@/components/midia/botao-site-oficial";
import { GaleriaVeiculo } from "@/components/midia/galeria-veiculo";
import { HeroVeiculo } from "@/components/midia/hero-veiculo";
import { VideoOficialEmbed } from "@/components/midia/video-oficial-embed";
import { BadgeEstado, FonteDado, ListaChecklist } from "@/components/tecnico/elementos";
import { Badge } from "@/components/ui/badge";
import { BadgeConfianca } from "@/components/ui/badge-confianca";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fonteOficialBr } from "@/lib/completude";
import { buscarVeiculoPorSlug } from "@/lib/dados/veiculos";
import { criarClienteSupabaseServidor } from "@/lib/supabase/server";
import type { EstadoConectividade, Rastreio } from "@/lib/tipos";
import { formatarData, formatarPreco } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await buscarVeiculoPorSlug(slug);
  return { title: r ? `${r.veiculo.marca} ${r.veiculo.nomeComercial}` : "Veículo" };
}

export default async function PaginaFichaVeiculo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await buscarVeiculoPorSlug(slug);
  if (!r) {
    notFound();
  }
  const { veiculo, tecnicos } = r;
  const completude = veiculo.completude!;

  // Modelos sem o pacote mínimo só ficam visíveis para o admin (pré-visualização).
  if (!completude.publicavel) {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) notFound();
  }

  const { ficha, multimidia, iluminacao, palhetas, interruptores } = tecnicos;
  const oems = [
    ...iluminacao.filter((i) => i.oem).map((i) => ({ codigo: i.oem!, descricao: `Lâmpada · ${i.posicao}`, dado: i as Rastreio })),
    ...palhetas.filter((p) => p.oem).map((p) => ({ codigo: p.oem!, descricao: `Palheta · ${p.posicao}`, dado: p as Rastreio })),
    ...interruptores.filter((i) => i.oem).map((i) => ({ codigo: i.oem!, descricao: `Interruptor · ${i.posicao}`, dado: i as Rastreio })),
  ];
  const fontes = Array.from(
    new Map(
      [ficha, multimidia, ...iluminacao, ...palhetas, ...interruptores]
        .filter((d): d is NonNullable<typeof d> => !!d)
        .map((d) => [d.fonteUrl, d.consultadoEm] as const),
    ),
  );
  const pendencias = completude.complementares.filter((i) => !i.ok);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/veiculos">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o catálogo
          </Link>
        </Button>
        <BadgeConfianca nivel={veiculo.confianca} />
      </div>

      {!completude.publicavel ? (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 text-sm">
          <p className="flex items-center gap-2 font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" />
            Pré-visualização do admin — este modelo ainda não aparece no site
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ele será publicado automaticamente quando todos os itens obrigatórios abaixo estiverem confirmados.
          </p>
          <ListaChecklist itens={completude.obrigatorios} className="mt-3 sm:grid-cols-2" />
        </div>
      ) : null}

      <HeroVeiculo
        veiculo={veiculo}
        logotipoMontadoraUrl={veiculo.montadora?.logotipoUrl ?? null}
      />

      <div className="flex flex-wrap gap-2">
        <BotaoSiteOficial
          url={veiculo.linkOficialUrl}
          marca={`${veiculo.marca} ${veiculo.nomeComercial}`}
          texto="Conheça no site oficial"
        />
        <BotaoSiteOficial
          url={veiculo.montadora?.siteOficialUrl ?? null}
          marca={veiculo.marca}
          texto={`Página inicial · ${veiculo.marca}`}
          variant="outline"
        />
      </div>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Categoria</p>
            <p className="mt-1 font-semibold flex items-center gap-1.5">
              <Car className="h-4 w-4 text-muted-foreground" />
              {veiculo.categoria}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Propulsão</p>
            <p className="mt-1 font-semibold flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-muted-foreground" />
              {veiculo.propulsao}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Lançamento no Brasil</p>
            <p className="mt-1 font-semibold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {veiculo.dataLancamentoBr ? formatarData(veiculo.dataLancamentoBr) : "A confirmar"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Preço de referência</p>
            <p className="mt-1 font-semibold">
              {veiculo.precoReferencia ? formatarPreco(veiculo.precoReferencia) : "A confirmar"}
            </p>
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="w-full flex-wrap h-auto">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="galeria">Galeria</TabsTrigger>
          <TabsTrigger value="multimidia">Multimídia</TabsTrigger>
          <TabsTrigger value="lampadas">Iluminação</TabsTrigger>
          <TabsTrigger value="palhetas">Palhetas</TabsTrigger>
          <TabsTrigger value="interruptores">Interruptores</TabsTrigger>
          <TabsTrigger value="oem">Códigos OEM</TabsTrigger>
          <TabsTrigger value="video">Vídeo oficial</TabsTrigger>
          <TabsTrigger value="fontes">Fontes</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Visão geral</CardTitle>
              <CardDescription>
                Diferencie sempre data de apresentação mundial, lançamento no Brasil, início das vendas e chegada às concessionárias.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              <Linha rotulo="Marca" valor={veiculo.marca} />
              <Linha rotulo="Modelo" valor={veiculo.nomeComercial} />
              <Linha rotulo="Geração" valor={veiculo.geracao} />
              <Linha rotulo="Ano-modelo" valor={veiculo.anoModelo ? String(veiculo.anoModelo) : "A confirmar"} />
              <Linha rotulo="Categoria" valor={veiculo.categoria} />
              <Linha rotulo="Propulsão" valor={veiculo.propulsao} />
              <Linha rotulo="Situação comercial" valor={veiculo.situacao} />
              <Linha
                rotulo="Lançamento BR"
                valor={veiculo.dataLancamentoBr ? formatarData(veiculo.dataLancamentoBr) : "A confirmar"}
              />
              {veiculo.resumo ? (
                <div className="sm:col-span-2 pt-2 text-sm text-muted-foreground">
                  {veiculo.resumo}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Ficha técnica básica</CardTitle>
              <CardDescription>
                Valores exatamente como publicados pela montadora no Brasil.
                {ficha?.versaoReferencia ? ` Referência: ${ficha.versaoReferencia}.` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ficha ? (
                <div className="grid gap-4">
                  <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Linha rotulo="Motor" valor={ficha.motor ?? "A confirmar"} />
                    <Linha rotulo="Potência" valor={ficha.potencia ?? "A confirmar"} />
                    <Linha rotulo="Torque" valor={ficha.torque ?? "A confirmar"} />
                    <Linha rotulo="Câmbio" valor={ficha.cambio ?? "A confirmar"} />
                    <Linha rotulo="Tração" valor={ficha.tracao ?? "A confirmar"} />
                    {ficha.bateria || veiculo.propulsao !== "Combustão" ? (
                      <Linha rotulo="Bateria" valor={ficha.bateria ?? "A confirmar"} />
                    ) : null}
                    {ficha.autonomia || veiculo.propulsao === "Elétrico" ? (
                      <Linha rotulo="Autonomia" valor={ficha.autonomia ?? "A confirmar"} />
                    ) : null}
                  </div>
                  <FonteDado dado={ficha} />
                </div>
              ) : (
                <SemDadosExplicativo
                  titulo="Ficha técnica ainda não coletada"
                  descricao="Motor, potência e câmbio entram quando forem confirmados na página oficial brasileira do modelo."
                />
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Pendências registradas</CardTitle>
              <CardDescription>
                Informações complementares ainda não confirmadas em fonte oficial. Nada é preenchido por suposição.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendencias.length ? (
                <ListaChecklist itens={completude.complementares} className="sm:grid-cols-2" />
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma pendência — todos os dados complementares confirmados.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="galeria">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de fotos</CardTitle>
              <CardDescription>
                Fotos oficiais da montadora (sala de imprensa / kits de mídia) terão prioridade. Fontes complementares são identificadas separadamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GaleriaVeiculo
                nome={`${veiculo.marca} ${veiculo.nomeComercial}`}
                categoria={veiculo.categoria}
                propulsao={veiculo.propulsao}
                galeria={veiculo.galeriaUrls}
                fotoPrincipal={veiculo.fotoPrincipalUrl}
                montadoraSlug={veiculo.montadoraSlug}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="multimidia">
          <Card>
            <CardHeader>
              <CardTitle>Sistema multimídia e conectividade</CardTitle>
              <CardDescription>
                Prioridade máxima do projeto. CarPlay/Android Auto são sempre registrados separando versão com fio e sem fio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {multimidia ? (
                <div className="grid gap-6">
                  <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Linha rotulo="Tela" valor={multimidia.telaPolegadas ?? "A confirmar"} />
                    <Linha rotulo="Sistema" valor={multimidia.sistema ?? "A confirmar"} />
                  </div>
                  <Separator />
                  <div>
                    <p className="mb-3 text-sm font-semibold">Apple CarPlay e Android Auto</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ItemConectividade titulo="Apple CarPlay (disponibilidade)" estado={multimidia.carplay} />
                      <ItemConectividade titulo="Android Auto (disponibilidade)" estado={multimidia.androidAuto} />
                      <ItemConectividade titulo="CarPlay via cabo" estado={multimidia.carplayCabo} />
                      <ItemConectividade titulo="CarPlay sem fio" estado={multimidia.carplaySemFio} />
                      <ItemConectividade titulo="Android Auto via cabo" estado={multimidia.androidAutoCabo} />
                      <ItemConectividade titulo="Android Auto sem fio" estado={multimidia.androidAutoSemFio} />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      “Não identificado” significa que a fonte oficial não especifica — a conexão não é presumida.
                    </p>
                  </div>
                  {multimidia.observacoes ? (
                    <p className="text-sm text-muted-foreground">{multimidia.observacoes}</p>
                  ) : null}
                  <FonteDado dado={multimidia} />
                </div>
              ) : (
                <SemDadosExplicativo
                  titulo="Dados de multimídia ainda não coletados"
                  descricao="Tela, CarPlay e Android Auto (cabo e sem fio) entram quando forem confirmados na página oficial brasileira do modelo."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lampadas">
          <Card>
            <CardHeader>
              <CardTitle>Iluminação e lâmpadas</CardTitle>
              <CardDescription>
                Tecnologia por posição conforme a montadora. Códigos (H4, H7, HB3...) e OEM só quando publicados em fonte oficial — nunca presumir equivalência.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {iluminacao.length ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Posição</TableHead>
                        <TableHead>Tecnologia</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Potência</TableHead>
                        <TableHead>OEM</TableHead>
                        <TableHead>Confiança</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {iluminacao.map((l) => (
                        <TableRow key={l.posicao}>
                          <TableCell className="font-medium">
                            {l.posicao}
                            {l.versoes ? (
                              <p className="text-xs font-normal text-muted-foreground">{l.versoes}</p>
                            ) : null}
                          </TableCell>
                          <TableCell>{l.tecnologia ?? "A confirmar"}</TableCell>
                          <TableCell>
                            {l.codigo ? <Badge variant="secondary">{l.codigo}</Badge> : <span className="text-muted-foreground">A confirmar</span>}
                          </TableCell>
                          <TableCell>{l.potencia ?? <span className="text-muted-foreground">A confirmar</span>}</TableCell>
                          <TableCell className="font-mono text-xs">{l.oem ?? <span className="font-sans text-muted-foreground">A confirmar</span>}</TableCell>
                          <TableCell><BadgeConfianca nivel={l.confianca} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="space-y-2 p-4">
                    {Array.from(new Map(iluminacao.map((l) => [l.fonteUrl, l])).values()).map((l) => (
                      <FonteDado key={l.fonteUrl} dado={l} />
                    ))}
                  </div>
                </>
              ) : (
                <SemDadosExplicativo
                  titulo="Iluminação ainda não mapeada"
                  descricao="A tecnologia dos faróis entra quando confirmada na página oficial brasileira; códigos de lâmpada e OEM ficam como pendência até haver fonte oficial."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="palhetas">
          <Card>
            <CardHeader>
              <CardTitle>Palhetas dos limpadores</CardTitle>
              <CardDescription>
                Medidas em mm e polegadas, encaixe e OEM — distinguir sempre original × reposição compatível.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {palhetas.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Medida (mm)</TableHead>
                      <TableHead>Medida (pol)</TableHead>
                      <TableHead>Encaixe</TableHead>
                      <TableHead>OEM</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {palhetas.map((p) => (
                      <TableRow key={p.posicao}>
                        <TableCell className="font-medium">{p.posicao}</TableCell>
                        <TableCell>{p.medidaMm ?? "A confirmar"}</TableCell>
                        <TableCell>{p.medidaPol ?? "A confirmar"}</TableCell>
                        <TableCell>{p.encaixe ?? "A confirmar"}</TableCell>
                        <TableCell className="font-mono text-xs">{p.oem ?? "A confirmar"}</TableCell>
                        <TableCell><BadgeConfianca nivel={p.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Palhetas ainda não mapeadas"
                  descricao="Medidas (mm/pol), encaixe e OEM ficam como pendência até serem confirmados em fonte oficial (manual do proprietário ou catálogo da montadora)."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interruptores">
          <Card>
            <CardHeader>
              <CardTitle>Interruptores e componentes elétricos</CardTitle>
              <CardDescription>
                Prioridade para o interruptor quádruplo do motorista.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {interruptores.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pinos</TableHead>
                      <TableHead>Conector</TableHead>
                      <TableHead>OEM</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interruptores.map((i) => (
                      <TableRow key={i.posicao}>
                        <TableCell className="font-medium">{i.posicao}</TableCell>
                        <TableCell>{i.tipo ?? "A confirmar"}</TableCell>
                        <TableCell>{i.pinos ?? "A confirmar"}</TableCell>
                        <TableCell>{i.conector ?? "A confirmar"}</TableCell>
                        <TableCell className="font-mono text-xs">{i.oem ?? "A confirmar"}</TableCell>
                        <TableCell><BadgeConfianca nivel={i.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Interruptores ainda não mapeados"
                  descricao="OEM, pinagem e conector ficam como pendência até serem confirmados em fonte oficial."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="oem">
          <Card>
            <CardHeader>
              <CardTitle>Códigos OEM relacionados</CardTitle>
              <CardDescription>
                Diferenciar OEM original, código padronizado, código comercial de reposição e referência de marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {oems.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Aplicação</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oems.map((o) => (
                      <TableRow key={`${o.codigo}-${o.descricao}`}>
                        <TableCell className="font-mono text-xs">{o.codigo}</TableCell>
                        <TableCell>{o.descricao}</TableCell>
                        <TableCell><BadgeConfianca nivel={o.dado.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Nenhum OEM associado ainda"
                  descricao="Códigos OEM só entram com fonte oficial (catálogo de peças ou manual da montadora). Pendência registrada."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Vídeo oficial de apresentação</CardTitle>
              <CardDescription>
                Apenas vídeos do canal oficial da montadora. Vídeos de terceiros não entram aqui automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoOficialEmbed
                url={veiculo.videoOficialUrl}
                nome={`${veiculo.marca} ${veiculo.nomeComercial}`}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fontes">
          <Card>
            <CardHeader>
              <CardTitle>Fontes consultadas</CardTitle>
              <CardDescription>
                Todas as páginas oficiais usadas nesta ficha, com data de consulta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {fonteOficialBr(veiculo) ? (
                  <ItemFonte url={fonteOficialBr(veiculo)!} rotulo="Comercialização no Brasil" data={veiculo.verificadoBrEm} />
                ) : null}
                {veiculo.fotoPrincipalFonteUrl ? (
                  <ItemFonte url={veiculo.fotoPrincipalFonteUrl} rotulo={`Foto: ${veiculo.fotoPrincipalCredito ?? "crédito na imagem"}`} data={null} />
                ) : null}
                {fontes.map(([url, data]) => (
                  <ItemFonte key={url} url={url} rotulo="Dados técnicos" data={data} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b pb-2 text-sm last:border-0">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className="text-right font-medium">{valor}</span>
    </div>
  );
}

function ItemConectividade({
  titulo,
  estado,
}: {
  titulo: string;
  estado: EstadoConectividade;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card p-3 text-sm">
      <span className="font-medium">{titulo}</span>
      <BadgeEstado estado={estado} />
    </div>
  );
}

function SemDadosExplicativo({
  titulo,
  descricao,
}: {
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-10 text-center text-sm">
      <p className="font-medium">{titulo}</p>
      <p className="max-w-md text-xs text-muted-foreground">{descricao}</p>
    </div>
  );
}

function ItemFonte({ url, rotulo, data }: { url: string; rotulo: string; data: string | null }) {
  return (
    <li className="flex flex-col gap-0.5 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-muted-foreground">{rotulo}</span>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 break-all font-medium text-primary hover:underline"
      >
        {url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 70)}
        <ExternalLink className="h-3 w-3 shrink-0" />
        {data ? <span className="ml-1 font-normal text-muted-foreground">· {formatarData(data)}</span> : null}
      </a>
    </li>
  );
}
