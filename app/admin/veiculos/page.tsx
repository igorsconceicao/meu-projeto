import Link from "next/link";
import { CheckCircle2, Eye, Pencil, PlusCircle, Wrench } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { BotaoExcluirVeiculo } from "@/components/admin/botoes-excluir";
import { FotoVeiculo } from "@/components/midia/foto-veiculo";
import { LogoMontadora } from "@/components/midia/logo-montadora";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buscarVeiculos } from "@/lib/dados/veiculos";

export const dynamic = "force-dynamic";

export default async function PaginaAdminVeiculos() {
  const veiculos = await buscarVeiculos();
  const publicados = veiculos.filter((v) => v.completude?.publicavel).length;

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Veículos"
        descricao={`${veiculos.length} modelos cadastrados · ${publicados} publicados no site · ${veiculos.length - publicados} em verificação. Um modelo aparece no site assim que CarPlay e Android Auto estão identificados (com fonte).`}
        acoes={
          <Button asChild>
            <Link href="/admin/veiculos/novo">
              <PlusCircle className="h-4 w-4" />
              Novo veículo
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Modelo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Ano</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Propulsão</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Foto</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {veiculos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum veículo. Clique em &ldquo;Novo veículo&rdquo; acima.
                </TableCell>
              </TableRow>
            ) : (
              veiculos.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <p className="font-medium">{v.nomeComercial}</p>
                    <p className="text-xs text-muted-foreground">{v.slug}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 min-w-0">
                      <LogoMontadora
                        nome={v.marca}
                        slug={v.montadoraSlug}
                        logotipoUrl={v.montadora?.logotipoUrl ?? null}
                        tamanho="sm"
                      />
                      <span className="truncate text-sm">{v.marca}</span>
                    </div>
                  </TableCell>
                  <TableCell>{v.anoModelo ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{v.propulsao}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{v.situacao}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    {v.completude?.publicavel ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Publicado
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="warning">Em verificação</Badge>
                        <Link href={`/admin/veiculos/${v.id}/tecnicos`} className="block text-[11px] leading-snug text-muted-foreground hover:text-primary">
                          Falta:{" "}
                          {v.completude?.obrigatorios
                            .filter((i) => !i.ok)
                            .map((i) => i.rotulo.toLowerCase())
                            .join(", ")}
                        </Link>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="h-10 w-16">
                      <FotoVeiculo
                        nome={`${v.marca} ${v.nomeComercial}`}
                        categoria={v.categoria}
                        propulsao={v.propulsao}
                        fotoUrl={v.fotoPrincipalUrl}
                        montadoraSlug={v.montadoraSlug}
                        proporcao="16/9"
                        mostrarAviso={false}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label={`Ver ficha de ${v.nomeComercial}`}>
                        <Link href={`/veiculos/${v.slug}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild aria-label={`Dados técnicos de ${v.nomeComercial}`} title="Dados técnicos">
                        <Link href={`/admin/veiculos/${v.id}/tecnicos`}>
                          <Wrench className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild aria-label={`Editar ${v.nomeComercial}`}>
                        <Link href={`/admin/veiculos/${v.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <BotaoExcluirVeiculo id={v.id} nome={`${v.marca} ${v.nomeComercial}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
