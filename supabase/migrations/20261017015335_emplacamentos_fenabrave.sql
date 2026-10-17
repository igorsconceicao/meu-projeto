create table public.emplacamentos (
  id uuid primary key default gen_random_uuid(),
  periodo date not null,
  tipo text not null check (tipo in ('mensal','acumulado')),
  segmento text not null check (segmento in ('Automóveis','Comerciais leves')),
  posicao integer not null,
  marca text not null,
  modelo text not null,
  unidades integer not null,
  fonte_url text not null,
  edicao text,
  consultado_em date not null default current_date,
  unique (periodo, tipo, segmento, posicao)
);
comment on table public.emplacamentos is 'Ranking oficial de emplacamentos (Fenabrave, informativo mensal), sem ajustes';
create index on public.emplacamentos (periodo desc);
alter table public.emplacamentos enable row level security;
create policy "Leitura pública" on public.emplacamentos for select using (true);
