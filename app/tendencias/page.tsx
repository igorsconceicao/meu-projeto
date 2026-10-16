import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = {
  title: "Tendências e consumidores",
};

export default function PaginaTendencias() {
  return (
    <EmConstrucao
      titulo="Tendências e consumidores"
      descricao="O que os donos dos carros estão comentando e quais acessórios estão em alta no mercado de reposição."
      vaiMostrar={[
        "Reclamações e elogios recorrentes por modelo (multimídia, iluminação, conectividade)",
        "Acessórios mais procurados para os modelos do catálogo",
        "Volume de buscas por modelo e por componente",
      ]}
      fontes={[
        "Reclame Aqui e fóruns de proprietários",
        "YouTube (reviews de canais especializados)",
        "Google Trends Brasil",
      ]}
    />
  );
}
