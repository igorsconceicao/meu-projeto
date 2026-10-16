import { EmConstrucao } from "@/components/layout/em-construcao";

export const metadata = {
  title: "Oportunidades de inovação",
};

export default function PaginaOportunidades() {
  return (
    <EmConstrucao
      titulo="Oportunidades de inovação"
      descricao="Cruzamento do catálogo técnico com o mercado para apontar produtos que a importadora pode desenvolver ou trazer."
      vaiMostrar={[
        "Modelos com muitas vendas e CarPlay/Android Auto só por cabo (oportunidade de adaptador sem fio)",
        "Modelos com faróis halógenos nas versões de entrada (oportunidade de kits LED homologados)",
        "Medidas de palheta e códigos de lâmpada mais frequentes no catálogo",
        "Cada oportunidade com veículos-alvo, evidências e o que falta validar",
      ]}
      fontes={[
        "Catálogo técnico desta plataforma (dados com fonte oficial)",
        "Ranking de vendas (módulo Mercado)",
        "Tendências de consumidores (módulo Tendências)",
      ]}
    />
  );
}
