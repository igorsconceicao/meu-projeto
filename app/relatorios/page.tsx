import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = {
  title: "Relatórios",
};

export default function PaginaRelatorios() {
  return (
    <EmConstrucao
      titulo="Relatórios de atualização"
      descricao="Resumo de cada rodada de atualização do catálogo: o que entrou, o que mudou e o que ainda falta confirmar."
      vaiMostrar={[
        "Modelos novos publicados na rodada",
        "Mudanças técnicas detectadas (ex.: central multimídia nova, faróis que passaram a ser LED)",
        "Pendências que continuam abertas por marca",
        "Exportação em PDF e planilha",
      ]}
      fontes={[
        "Histórico de alterações do próprio catálogo",
        "Sites oficiais e salas de imprensa das montadoras no Brasil",
      ]}
    />
  );
}
