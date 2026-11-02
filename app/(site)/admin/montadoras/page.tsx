import Link from "next/link";
import { Pencil, PlusCircle } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { BotaoExcluirMontadora } from "@/components/admin/botoes-excluir";
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
import { buscarMontadoras } from "@/lib/dados/montadoras";

export const dynamic = "force-dynamic";

export default async function PaginaAdminMontadoras() {
  const montadoras = await buscarMontadoras();

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Montadoras"
        descricao={`${montadoras.length} marcas cadastradas. Clique em uma linha para editar.`}
        acoes={
          <Button asChild>
            <Link href="/admin/montadoras/novo">
              <PlusCircle className="h-4 w-4" />
              Nova montadora
            </Link>
          </Button>
        }
      />

      <div className="overflow-hidden rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Grupo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Modelos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {montadoras.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma montadora. Clique em &ldquo;Nova montadora&rdquo; acima.
                </TableCell>
              </TableRow>
            ) : (
              montadoras.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3 min-w-0">
                      <LogoMontadora
                        nome={m.nome}
                        slug={m.slug}
                        logotipoUrl={m.logotipoUrl}
                        tamanho="sm"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{m.nome}</p>
                        <p className="truncate text-xs text-muted-foreground">{m.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {m.grupo ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">{m.pais}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{m.qtdModelos ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="icon" asChild aria-label={`Editar ${m.nome}`}>
                        <Link href={`/admin/montadoras/${m.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <BotaoExcluirMontadora id={m.id} nome={m.nome} />
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
