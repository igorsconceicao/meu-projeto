import {
  BarChart3,
  Building2,
  Car,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Search,
  Settings,
  TrendingUp,
} from "lucide-react";

export type ItemNavegacao = {
  titulo: string;
  descricao: string;
  href: string;
  icone: typeof LayoutDashboard;
  /** Módulo ainda sem dados reais */
  emBreve?: boolean;
};

export type GrupoNavegacao = {
  titulo: string;
  itens: ItemNavegacao[];
};

export const NAVEGACAO: GrupoNavegacao[] = [
  {
    titulo: "Visão geral",
    itens: [
      {
        titulo: "Dashboard",
        descricao: "Resumo do catálogo",
        href: "/",
        icone: LayoutDashboard,
      },
    ],
  },
  {
    titulo: "Catálogo técnico",
    itens: [
      {
        titulo: "Montadoras",
        descricao: "Marcas e portfólio",
        href: "/montadoras",
        icone: Building2,
      },
      {
        titulo: "Veículos",
        descricao: "Fichas técnicas",
        href: "/veiculos",
        icone: Car,
      },
      {
        titulo: "Busca por OEM",
        descricao: "Lâmpadas e códigos OEM",
        href: "/busca-oem",
        icone: Search,
      },
    ],
  },
  {
    titulo: "Mercado",
    itens: [
      {
        titulo: "Vendas e rankings",
        descricao: "Fenabrave / Anfavea",
        href: "/mercado",
        emBreve: true,
        icone: BarChart3,
      },
      {
        titulo: "Tendências",
        descricao: "Opiniões e acessórios",
        href: "/tendencias",
        emBreve: true,
        icone: TrendingUp,
      },
    ],
  },
  {
    titulo: "Inovação",
    itens: [
      {
        titulo: "Oportunidades",
        descricao: "Para o laboratório",
        href: "/oportunidades",
        emBreve: true,
        icone: Lightbulb,
      },
      {
        titulo: "Relatórios",
        descricao: "Histórico de atualizações",
        href: "/relatorios",
        emBreve: true,
        icone: FileText,
      },
    ],
  },
  {
    titulo: "Sistema",
    itens: [
      {
        titulo: "Administração",
        descricao: "Cadastro e pendências",
        href: "/admin",
        icone: Settings,
      },
    ],
  },
];
