import {
  BarChart3,
  Building2,
  Car,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Search,
  Settings,
} from "lucide-react";

export type ItemNavegacao = {
  titulo: string;
  descricao: string;
  href: string;
  icone: typeof LayoutDashboard;
  /** Módulo ainda sem dados reais */
  emBreve?: boolean;
  /** Outras rotas que deixam este item marcado como ativo */
  tambem?: string[];
};

export type GrupoNavegacao = {
  titulo: string;
  itens: ItemNavegacao[];
};

export const NAVEGACAO: GrupoNavegacao[] = [
  {
    titulo: "Consultar",
    itens: [
      { titulo: "Início", descricao: "Busca e resumo", href: "/", icone: LayoutDashboard },
      { titulo: "Veículos", descricao: "CarPlay, Android Auto e palhetas", href: "/veiculos", icone: Car },
      { titulo: "Montadoras", descricao: "Modelos por marca", href: "/montadoras", icone: Building2 },
    ],
  },
  {
    titulo: "Mercado",
    itens: [
      {
        titulo: "Vendas e tendências",
        descricao: "Mais emplacados (Fenabrave)",
        href: "/mercado",
        icone: BarChart3,
        tambem: ["/tendencias"],
      },
      { titulo: "Oportunidades", descricao: "Ideias para o laboratório", href: "/oportunidades", icone: Lightbulb },
    ],
  },
  {
    titulo: "Mais",
    itens: [
      { titulo: "Relatórios e planilha", descricao: "Baixar dados em Excel", href: "/relatorios", icone: FileText },
      { titulo: "Busca por código", descricao: "Lâmpadas, palhetas e OEM", href: "/busca-oem", icone: Search },
      { titulo: "Administração", descricao: "Cadastro e novidades", href: "/admin", icone: Settings },
    ],
  },
];
