import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Car, Zap } from "lucide-react";
import { BotaoSiteOficial } from "@/components/midia/botao-site-oficial";
import { GaleriaVeiculo } from "@/components/midia/galeria-veiculo";
import { HeroVeiculo } from "@/components/midia/hero-veiculo";
import { VideoOficialEmbed } from "@/components/midia/video-oficial-embed";
import { AlertaDemo } from "@/components/ui/alerta-demo";
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
import { buscarVeiculoPorSlug } from "@/lib/dados/veiculos";
import {
  CODIGOS_OEM,
  INTERRUPTORES,
  LAMPADAS,
  MULTIMIDIAS,
  PALHETAS,
  type EstadoRecurso,
} from "@/lib/dados-demo";
import { formatarData, formatarPreco } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ROTULOS_ESTADO: Record<EstadoRecurso, { label: string; variant: "success" | "secondary" | "warning" }> = {
  confirmado: { label: "Confirmado", variant: "success" },
  nao_disponivel: { label: "Não disponível", variant: "secondary" },
  nao_identificado: { label: "Não identificado", variant: "warning" },
  depende_versao: { label: "Depende da versão", variant: "warning" },
};

function BadgeEstado({ estado }: { estado: EstadoRecurso }) {
  const cfg = ROTULOS_ESTADO[estado];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const veiculo = await buscarVeiculoPorSlug(slug);
  return { title: veiculo ? `${veiculo.marca} ${veiculo.nomeComercial}` : "Veículo" };
}

export default async function PaginaFichaVeiculo({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const veiculo = await buscarVeiculoPorSlug(slug);
  if (!veiculo) {
    notFound();
  }

  const multimidia = MULTIMIDIAS.find((m) => m.veiculoSlug === slug);
  const lampadas = LAMPADAS.filter((l) => l.veiculoSlug === slug);
  const palhetas = PALHETAS.filter((p) => p.veiculoSlug === slug);
  const interruptores = INTERRUPTORES.filter((i) => i.veiculoSlug === slug);
  const oems = CODIGOS_OEM.filter((o) => o.aplicacoes.includes(slug));

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
          <TabsTrigger value="lampadas">Lâmpadas</TabsTrigger>
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
                    <Linha rotulo="Fabricante" valor={multimidia.fabricante} />
                    <Linha rotulo="Modelo da unidade" valor={multimidia.modeloEquipamento} />
                    <Linha rotulo="Tela" valor={multimidia.tamanhoTela} />
                    <Linha rotulo="Resolução" valor={multimidia.resolucao} />
                    <Linha rotulo="Sistema operacional" valor={multimidia.so} />
                    <Linha rotulo="Portas USB" valor={multimidia.portasUsb} />
                    <Linha rotulo="Alto-falantes" valor={multimidia.altoFalantes} />
                  </div>
                  <Separator />
                  <div>
                    <p className="mb-3 text-sm font-semibold">
                      Apple CarPlay e Android Auto
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ItemConectividade titulo="CarPlay via cabo" estado={multimidia.carplayCabo} />
                      <ItemConectividade titulo="CarPlay sem fio" estado={multimidia.carplaySemFio} />
                      <ItemConectividade titulo="Android Auto via cabo" estado={multimidia.androidAutoCabo} />
                      <ItemConectividade titulo="Android Auto sem fio" estado={multimidia.androidAutoSemFio} />
                      <ItemConectividade titulo="Bluetooth" estado={multimidia.bluetooth} />
                      <ItemConectividade titulo="Wi-Fi" estado={multimidia.wifi} />
                      <ItemConectividade titulo="GPS nativo" estado={multimidia.gpsNativo} />
                    </div>
                  </div>
                </div>
              ) : (
                <SemDadosExplicativo
                  titulo="Dados de multimídia ainda não coletados"
                  descricao="Serão preenchidos pela Iteração 4 (fichas técnicas detalhadas) ou pela Iteração 6 (coleta automática das salas de imprensa das montadoras)."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lampadas">
          <Card>
            <CardHeader>
              <CardTitle>Lâmpadas automotivas</CardTitle>
              <CardDescription>
                Códigos padronizados (H7, H11, HB3...) × OEM original. Nunca presumir equivalência.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {lampadas.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Posição</TableHead>
                      <TableHead>Código padrão</TableHead>
                      <TableHead>Tecnologia</TableHead>
                      <TableHead>Potência</TableHead>
                      <TableHead>OEM</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lampadas.map((l, idx) => (
                      <TableRow key={`${l.posicao}-${idx}`}>
                        <TableCell className="font-medium">{l.posicao}</TableCell>
                        <TableCell><Badge variant="secondary">{l.codigo}</Badge></TableCell>
                        <TableCell>{l.tecnologia}</TableCell>
                        <TableCell>{l.potencia}</TableCell>
                        <TableCell className="font-mono text-xs">{l.oem}</TableCell>
                        <TableCell><BadgeConfianca nivel={l.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Lâmpadas ainda não mapeadas"
                  descricao="Códigos H7, H11, HB3 e OEM específicos serão cadastrados pela Iteração 4 ou coletados automaticamente de catálogos oficiais."
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
                      <TableHead>Formato</TableHead>
                      <TableHead>OEM</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {palhetas.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{p.posicao}</TableCell>
                        <TableCell>{p.medidaMm}</TableCell>
                        <TableCell>{p.medidaPol}</TableCell>
                        <TableCell>{p.encaixe}</TableCell>
                        <TableCell>{p.formato}</TableCell>
                        <TableCell className="font-mono text-xs">{p.oem}</TableCell>
                        <TableCell><BadgeConfianca nivel={p.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Palhetas ainda não mapeadas"
                  descricao="Medidas específicas por versão e ano-modelo serão coletadas pela Iteração 4."
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
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pinos</TableHead>
                      <TableHead>Conector</TableHead>
                      <TableHead>Iluminado</TableHead>
                      <TableHead>OEM</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interruptores.map((i, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{i.tipo}</TableCell>
                        <TableCell>{i.pinos}</TableCell>
                        <TableCell>{i.conector}</TableCell>
                        <TableCell>{i.iluminado ? "Sim" : "Não"}</TableCell>
                        <TableCell className="font-mono text-xs">{i.oem}</TableCell>
                        <TableCell><BadgeConfianca nivel={i.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Interruptores ainda não mapeados"
                  descricao="OEM, pinagem e conectores serão cadastrados pela Iteração 4."
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
                      <TableHead>Descrição</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Confiança</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oems.map((o) => (
                      <TableRow key={o.codigo}>
                        <TableCell className="font-mono text-xs">{o.codigo}</TableCell>
                        <TableCell>{o.descricao}</TableCell>
                        <TableCell><Badge variant="secondary">{o.categoria}</Badge></TableCell>
                        <TableCell><BadgeConfianca nivel={o.confianca} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <SemDadosExplicativo
                  titulo="Nenhum OEM associado ainda"
                  descricao="Códigos OEM e aplicações cruzadas serão cadastrados pela Iteração 4 e cruzados na Iteração 5."
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
                Cada dado técnico desta ficha terá URL, data de consulta e trecho de evidência quando a coleta real estiver ativa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertaDemo mensagem="Rastreabilidade de fontes será preenchida a partir da Iteração 6." />
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
  estado: EstadoRecurso;
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
