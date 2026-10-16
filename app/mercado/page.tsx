import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = {
  title: "Mercado e vendas",
};

export default function PaginaMercado() {
  return (
    <EmConstrucao
      titulo="Mercado e vendas"
      descricao="Rankings e evolução dos emplacamentos no Brasil, por marca, modelo e segmento."
      vaiMostrar={[
        "Ranking mensal de emplacamentos por modelo e por marca",
        "Variação mês a mês e acumulado do ano",
        "Participação de elétricos e híbridos",
        "Ligação direta de cada modelo do ranking com a sua ficha técnica",
      ]}
      fontes={[
        "Fenabrave — emplacamentos mensais (relatórios públicos)",
        "Anfavea — produção e licenciamento",
        "ABVE — veículos eletrificados",
      ]}
    />
  );
}
