-- Dados técnicos por veículo, sempre com fonte, data de consulta e confiança.
-- Aplicada no projeto Supabase em 2026-10-15 (migration "dados_tecnicos_veiculos").

create type estado_conectividade as enum ('confirmado','nao_disponivel','nao_identificado','depende_versao');

create table public.fichas_tecnicas (
  veiculo_id uuid primary key references public.veiculos(id) on delete cascade,
  versao_referencia text,
  motor text,
  potencia text,
  torque text,
  cambio text,
  tracao text,
  bateria text,
  autonomia text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now()
);

create table public.multimidias (
  veiculo_id uuid primary key references public.veiculos(id) on delete cascade,
  tela_polegadas text,
  sistema text,
  carplay estado_conectividade not null default 'nao_identificado',
  android_auto estado_conectividade not null default 'nao_identificado',
  carplay_cabo estado_conectividade not null default 'nao_identificado',
  carplay_sem_fio estado_conectividade not null default 'nao_identificado',
  android_auto_cabo estado_conectividade not null default 'nao_identificado',
  android_auto_sem_fio estado_conectividade not null default 'nao_identificado',
  observacoes text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now()
);

create table public.iluminacao (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  posicao text not null,
  tecnologia text,
  codigo text,
  potencia text,
  oem text,
  versoes text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now(),
  unique (veiculo_id, posicao)
);

create table public.palhetas (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  posicao text not null,
  medida_mm integer,
  medida_pol numeric,
  encaixe text,
  oem text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now(),
  unique (veiculo_id, posicao)
);

create table public.interruptores_vidro (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  posicao text not null,
  tipo text,
  oem text,
  pinos integer,
  conector text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now(),
  unique (veiculo_id, posicao)
);

create index on public.iluminacao (veiculo_id);
create index on public.palhetas (veiculo_id);
create index on public.interruptores_vidro (veiculo_id);

-- Leitura pública; escrita só por usuários autenticados (admin).
do $$
declare t text;
begin
  foreach t in array array['fichas_tecnicas','multimidias','iluminacao','palhetas','interruptores_vidro'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Leitura pública" on public.%I for select using (true)', t);
    execute format('create policy "Inserção por autenticados" on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy "Atualização por autenticados" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "Deleção por autenticados" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;
