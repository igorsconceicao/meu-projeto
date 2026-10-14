# Plataforma de Inteligência Automotiva — Brasil

Central interna de inteligência de mercado automotivo brasileiro: lançamentos a partir de 2025, multimídia e conectividade (CarPlay / Android Auto), lâmpadas, palhetas, interruptores, códigos OEM, vendas, tendências e oportunidades de inovação.

> **Status:** Iteração 1 (fundação visível). Todas as informações exibidas no site ainda são **dados de demonstração**, marcados como tal. A coleta real de fontes começa na Iteração 6.

---

## O que já funciona nesta versão

- Site navegável com visual profissional (tema claro e escuro, responsivo).
- Menu lateral com todas as seções do projeto:
  - **Dashboard** — resumo da semana.
  - **Montadoras** — lista de marcas monitoradas.
  - **Veículos** — catálogo e ficha técnica completa.
  - **Busca por OEM** — pesquisa de códigos (visual).
  - **Mercado** — rankings e vendas.
  - **Tendências** — opiniões e acessórios em alta.
  - **Oportunidades** — recomendações para o laboratório.
  - **Relatórios semanais** — histórico executivo.
  - **Administração** — fontes, custos, usuários.
- Busca global no cabeçalho (visual).
- Dados demo claramente identificados em todas as páginas.

## O que **ainda não** funciona (próximas iterações)

| Iteração | Entrega |
|---|---|
| 2 | Banco de dados (Supabase) + cadastro manual pelo admin |
| 3 | Login seguro no painel |
| 4 | Fichas técnicas detalhadas com evidências |
| 5 | Busca semântica por OEM |
| 6 | Coleta real de fontes (RSS + sites) |
| 7 | IA Gemini extraindo dados de notícias |
| 8 | Importação Fenabrave / Anfavea |
| 9 | Opiniões (Reddit / YouTube) + acessórios |
| 10 | Pipeline de oportunidades |
| 11 | Agendamento semanal automático (GitHub Actions) |
| 12 | Exportação PDF / Excel |

---

## Stack 100% gratuita

| Camada | Ferramenta |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | Tailwind CSS, shadcn/ui-style, lucide-react |
| Hospedagem | Vercel Hobby |
| Banco (iteração 2) | Supabase Free |
| IA (iteração 7) | Google Gemini (plano gratuito) |
| Agendamento | GitHub Actions (cron) |
| Scraping | Cheerio + Playwright + rss-parser |

Zero custo recorrente nesta primeira versão.

---

## Como rodar o projeto no seu computador

Pré-requisitos: **Node.js 20 ou superior** (recomendado 22) e **npm**.

```bash
# 1. Instalar as dependências
npm install

# 2. Rodar em modo de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

Outros comandos:

```bash
npm run build   # gera a versão de produção
npm run start   # roda a versão de produção
npm run lint    # verifica erros e estilo de código
```

---

## Como deixar o site publicado (Vercel)

1. Crie um repositório no GitHub e envie este projeto (as instruções abaixo são automáticas quando usamos o Claude).
2. Entre em [vercel.com](https://vercel.com) com sua conta GitHub.
3. Clique em **Add New → Project** e selecione o repositório.
4. Confirme as configurações padrão (framework "Next.js").
5. Clique em **Deploy**. Em cerca de 1 minuto o site está no ar.
6. A cada novo commit, a Vercel atualiza o site automaticamente.

> As variáveis de ambiente (chaves de API) serão adicionadas no painel da Vercel a partir da Iteração 2. Elas **nunca** devem ser enviadas pelo Git.

---

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha quando as integrações forem ativadas.

```bash
cp .env.example .env.local
```

Nada neste arquivo é usado ainda nesta primeira iteração.

---

## Estrutura do projeto

```
meu-projeto/
├── app/                # páginas (rotas) do Next.js
│   ├── page.tsx        # dashboard (home)
│   ├── layout.tsx      # layout global (sidebar + header)
│   ├── montadoras/     # lista de marcas
│   ├── veiculos/       # catálogo + ficha técnica
│   ├── busca-oem/      # busca por código OEM
│   ├── mercado/        # vendas e rankings
│   ├── tendencias/     # opiniões e acessórios
│   ├── oportunidades/  # recomendações para o laboratório
│   ├── relatorios/     # relatórios semanais
│   └── admin/          # painel administrativo
├── components/
│   ├── layout/         # sidebar, header, cabeçalho de página
│   ├── ui/             # botões, cartões, tabelas, etc.
│   └── theme-provider.tsx
├── lib/
│   ├── dados-demo.ts   # ← todos os dados fictícios do site
│   └── utils.ts        # funções utilitárias (formatação pt-BR)
├── public/             # imagens estáticas
└── ...
```

### Como mudar os dados exibidos

Enquanto o banco de dados não está ativo, tudo que você vê vem do arquivo `lib/dados-demo.ts`. Alterando os valores lá e rodando `npm run dev`, o site atualiza na hora.

---

## Regras técnicas do projeto

- Nunca inventar OEMs, especificações, vendas ou aplicações. Informação não encontrada vira **"A confirmar"**.
- Todo dado técnico terá, nas próximas iterações, **fonte + data + nível de confiança** (confirmado · bem fundamentado · a confirmar).
- Dados de demonstração são sempre identificados por `demo: true` nos registros e por um aviso visual na tela.
- Nenhuma chave de API fica no código do site. As chaves ficam em `.env.local` (local) e no painel da Vercel (produção).
