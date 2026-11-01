-- Diário de Bordo: registro de cada atualização (o que buscou, o que encontrou, números)
create table if not exists public.diario_bordo (
  id uuid primary key default gen_random_uuid(),
  realizado_em timestamptz not null default now(),
  tipo text not null default 'rotina' check (tipo in ('rotina','monitoramento','vendas','pesquisa','manual')),
  titulo text not null,
  resumo text not null,
  buscou text[] not null default '{}',
  encontrou text[] not null default '{}',
  numeros jsonb not null default '[]'::jsonb,
  pendencias text[] not null default '{}',
  fontes text[] not null default '{}',
  criado_em timestamptz not null default now()
);
alter table public.diario_bordo enable row level security;
create policy "diario_bordo leitura publica" on public.diario_bordo for select using (true);
create policy "diario_bordo escrita autenticada" on public.diario_bordo for insert to authenticated with check (true);
create policy "diario_bordo edicao autenticada" on public.diario_bordo for update to authenticated using (true) with check (true);
create index if not exists diario_bordo_realizado_em on public.diario_bordo (realizado_em desc);

-- Contagem diária do que foi gravado em cada área (hodômetro do banco)
create or replace view public.atividade_diaria with (security_invoker = true) as
with eventos as (
  select (atualizado_em at time zone 'America/Sao_Paulo')::date dia, 'multimidia' area from public.multimidias
  union all select (atualizado_em at time zone 'America/Sao_Paulo')::date, 'palhetas' from public.palhetas
  union all select (atualizado_em at time zone 'America/Sao_Paulo')::date, 'versoes' from public.versoes
  union all select (atualizado_em at time zone 'America/Sao_Paulo')::date, 'fichas' from public.fichas_tecnicas
  union all select (atualizado_em at time zone 'America/Sao_Paulo')::date, 'iluminacao' from public.iluminacao
  union all select (atualizado_em at time zone 'America/Sao_Paulo')::date, 'interruptores' from public.interruptores_vidro
  union all select (criado_em at time zone 'America/Sao_Paulo')::date, 'modelos_novos' from public.veiculos
  union all select (detectado_em at time zone 'America/Sao_Paulo')::date, 'novidades_detectadas' from public.monitor_novidades
  union all select (importado_em at time zone 'America/Sao_Paulo')::date, 'vendas' from public.emplacamentos_segmentos
)
select dia, area, count(*)::int as registros from eventos where dia is not null group by dia, area;
