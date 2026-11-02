import {
  BarChart3,
  Building2,
  Car,
  FileText,
  LayoutDashboard,
  Lightbulb,
  NotebookPen,
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
  /** Só aparece para quem tem papel de administrador */
  soAdmin?: boolean;
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
      { titulo: "Diário de Bordo", descricao: "O que cada atualização trouxe", href: "/diario-de-bordo", icone: NotebookPen },
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
      { titulo: "Relatórios", descricao: "Histórico e planilha", href: "/relatorios", icone: FileText },
      { titulo: "Busca por código", descricao: "Lâmpadas, palhetas e OEM", href: "/busca-oem", icone: Search },
      { titulo: "Administração", descricao: "Cadastro e novidades", href: "/admin", icone: Settings, soAdmin: true },
    ],
  },
];
