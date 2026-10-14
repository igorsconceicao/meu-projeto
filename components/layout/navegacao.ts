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
        descricao: "Resumo da semana",
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
        descricao: "Pesquisa de códigos",
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
        icone: BarChart3,
      },
      {
        titulo: "Tendências",
        descricao: "Opiniões e acessórios",
        href: "/tendencias",
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
        icone: Lightbulb,
      },
      {
        titulo: "Relatórios semanais",
        descricao: "Histórico executivo",
        href: "/relatorios",
        icone: FileText,
      },
    ],
  },
  {
    titulo: "Sistema",
    itens: [
      {
        titulo: "Administração",
        descricao: "Fontes e configurações",
        href: "/admin",
        icone: Settings,
      },
    ],
  },
];
