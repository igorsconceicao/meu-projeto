# Plataforma de Inteligência Automotiva — Brasil

Central interna de inteligência de mercado automotivo brasileiro: lançamentos a partir de 2025, multimídia e conectividade (CarPlay / Android Auto), lâmpadas, palhetas, interruptores, códigos OEM, vendas, tendências e oportunidades de inovação.

> **Status:** catálogo real em produção — https://meu-projeto-puce-gamma.vercel.app. Nenhum dado é inventado: cada informação técnica tem link da fonte oficial, data de consulta e nível de confiança; o que falta aparece como pendência.

---

## O que o site faz

| Seção | O que mostra | De onde vêm os dados |
|---|---|---|
| **Dashboard** | Resumo clicável do catálogo (conectividade, faróis, propulsão, marcas) | Catálogo técnico |
| **Montadoras** | Marcas vendidas no Brasil, modelos publicados e em verificação | Sites oficiais brasileiros |
| **Veículos** | Catálogo com filtros (marca, categoria, propulsão, CarPlay/AA sem fio, farol) e ficha completa | Sites, fichas técnicas em PDF e salas de imprensa oficiais |
| **Busca** | Busca global no topo (modelos, marcas, componentes) | Catálogo |
| **Busca por OEM** | Pesquisa por código de peça | Só códigos com fonte |
| **Mercado** | 50 mais emplacados (automóveis e comerciais), mês e acumulado, ligados às fichas | Fenabrave (PDF oficial) |
| **Tendências** | Quem sobe e cai no ranking, participação por origem da marca, tecnologia por origem | Fenabrave + catálogo |
| **Oportunidades** | Listas para o laboratório (adaptador sem fio, faróis halógenos, central para versões, lacunas) com critério e evidência | Catálogo × Fenabrave |
| **Relatórios** | Situação por marca, histórico das rodadas e exportação CSV (abre no Excel) | Catálogo |
| **Admin** | Cadastro de marcas e veículos, edição dos dados técnicos com fonte, revisão de novidades | — |

Um modelo só aparece no site quando tem o pacote mínimo: foto real da versão brasileira, página oficial BR, motor e câmbio (ou bateria/autonomia), tela da central, CarPlay e Android Auto e tecnologia dos faróis.

## Como o site se atualiza sozinho

| O quê | Quando | Como |
|---|---|---|
| Ranking de emplacamentos | Diariamente do dia 1 ao 15 de cada mês (07:17, Brasília) | Função `importar-fenabrave` lê o PDF oficial mais recente da Fenabrave |
| Novidades nas montadoras | Toda segunda-feira (07:23, Brasília) | Função `monitorar-novidades` lê a página de gama de cada marca (ou o sitemap oficial), compara com a semana anterior e confere se as páginas dos modelos seguem no ar |

As novidades **não entram no site sozinhas**: aparecem em **Admin → Novidades detectadas** para revisão. Ali também fica a lista de modelos que a página oficial da marca mostra e que ainda não estão no catálogo. Sites que bloqueiam leitura automática (Honda, Toyota, Volvo, CAOA Chery, CAOA Changan) são cobertos nas rodadas manuais de pesquisa; Fiat, Jeep, Ram e Citroën são monitorados pelo portal de imprensa da Stellantis.

---

## Stack 100% gratuita

| Camada | Ferramenta |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| UI | Tailwind CSS, shadcn/ui-style, lucide-react |
| Hospedagem | Vercel Hobby |
| Banco | Supabase Free (Postgres + Auth + Edge Functions) |
| Agendamento | pg_cron no Supabase |
| Leitura de PDF | unpdf (nas Edge Functions) |

Zero custo recorrente: nenhuma rotina usa IA paga.

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
├── app/                    # páginas (rotas) do Next.js
│   ├── page.tsx            # dashboard
│   ├── montadoras/         # marcas e página de cada marca
│   ├── veiculos/           # catálogo + ficha técnica
│   ├── busca/, busca-oem/  # buscas
│   ├── mercado/            # ranking Fenabrave
│   ├── tendencias/         # movimentos de vendas e tecnologia
│   ├── oportunidades/      # listas para o laboratório
│   ├── relatorios/         # situação do catálogo + exportação
│   ├── api/                # busca (JSON) e exportação (CSV)
│   └── admin/              # painel: cadastro, dados técnicos, novidades
├── components/             # layout, catálogo, ficha técnica, admin, ui
├── lib/
│   ├── dados/              # leitura do banco (veículos, montadoras, técnicos, emplacamentos)
│   ├── completude.ts       # regra de publicação (pacote mínimo)
│   ├── oportunidades.ts    # regras das oportunidades
│   ├── tendencias.ts       # cálculos das tendências
│   └── monitor.ts          # cobertura do catálogo × páginas oficiais
└── supabase/
    ├── migrations/         # estrutura do banco
    └── functions/          # rotinas automáticas (Fenabrave, monitoramento, pesquisa de mídia)
```

### Como mudar os dados exibidos

Tudo vem do banco Supabase. Entre em **/admin** (usuário e senha do painel): ali se cadastram marcas e veículos e, em cada veículo, o botão **Dados técnicos** abre a edição de ficha, multimídia, iluminação, palhetas e interruptores — sempre com o link da fonte.

---

## Regras técnicas do projeto

- Nunca inventar OEMs, especificações, vendas ou aplicações. Informação não encontrada fica como pendência (**"A confirmar"**).
- Todo dado técnico tem **fonte + data de consulta + nível de confiança** (confirmado · bem fundamentado · não confirmado).
- Conexão sem fio só é marcada quando a fonte diz "sem fio"; ter CarPlay/Android Auto não basta.
- Fotos só da versão vendida no Brasil, com crédito; logotipos só os oficiais.
- Nenhuma chave de API fica no código do site. As chaves ficam em `.env.local` (local), no painel da Vercel e nos segredos do Supabase.
