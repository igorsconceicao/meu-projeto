import { Search } from "lucide-react";
import { CabecalhoPagina } from "@/components/layout/cabecalho-pagina";
import { AlertaDemo } from "@/components/ui/alerta-demo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const metadata = {
  title: "Busca por OEM",
};

export default function PaginaBuscaOem() {
  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        titulo="Busca por código OEM"
        descricao="Pesquise um código OEM para encontrar veículos compatíveis, componentes substitutos e possíveis aplicações cruzadas."
      />

      <AlertaDemo mensagem="A base de códigos OEM entra na Iteração 4 (fichas técnicas) e a busca semântica cruzada entra na Iteração 5." />

      <Card>
        <CardHeader>
          <CardTitle>Pesquisar</CardTitle>
          <CardDescription>
            Informe código OEM, descrição ou veículo. A busca será semântica (encontra códigos próximos) e cruzada entre marcas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Ex.: 12345-ABC, interruptor quádruplo, Aurora Sedã..."
                aria-label="Campo de busca OEM"
              />
            </div>
            <Button type="button" disabled>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de OEMs</CardTitle>
          <CardDescription>
            Códigos OEM e aplicações cruzadas serão cadastrados nas próximas iterações.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-dashed p-10 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Nenhum código OEM no banco ainda</p>
            <p className="mt-1 text-xs">
              Priorizar fontes técnicas confiáveis: catálogos oficiais, fabricantes de iluminação (Osram, Philips), palhetas (Bosch, DPK) e componentes elétricos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
