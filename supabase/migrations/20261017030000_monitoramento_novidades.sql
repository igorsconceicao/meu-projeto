-- Páginas oficiais monitoradas semanalmente (lista de modelos de cada marca).
create table public.monitor_fontes (
  id uuid primary key default gen_random_uuid(),
  montadora_id uuid references public.montadoras(id) on delete cascade,
  url text not null unique,
  ativo boolean not null default true,
  snapshot jsonb,
  verificado_em timestamptz,
  status_http integer,
  erro text,
  criado_em timestamptz not null default now()
);
comment on table public.monitor_fontes is 'Páginas oficiais lidas toda semana; snapshot = links de modelos encontrados na última leitura';

-- O que mudou entre uma leitura e outra. Nunca é publicado sozinho: fica para revisão no admin.
create table public.monitor_novidades (
  id uuid primary key default gen_random_uuid(),
  montadora_id uuid references public.montadoras(id) on delete cascade,
  veiculo_id uuid references public.veiculos(id) on delete cascade,
  tipo text not null check (tipo in ('link_novo','link_removido','pagina_fora_do_ar')),
  titulo text not null,
  url text not null,
  fonte_url text,
  status text not null default 'pendente' check (status in ('pendente','resolvido','ignorado')),
  detectado_em timestamptz not null default now(),
  resolvido_em timestamptz,
  unique (tipo, url)
);
create index on public.monitor_novidades (status, detectado_em desc);

alter table public.monitor_fontes enable row level security;
alter table public.monitor_novidades enable row level security;
create policy "Leitura por autenticados" on public.monitor_fontes for select to authenticated using (true);
create policy "Atualização por autenticados" on public.monitor_fontes for update to authenticated using (true) with check (true);
create policy "Leitura por autenticados" on public.monitor_novidades for select to authenticated using (true);
create policy "Atualização por autenticados" on public.monitor_novidades for update to authenticated using (true) with check (true);

-- Fontes iniciais: o site oficial brasileiro cadastrado de cada montadora.
insert into public.monitor_fontes (montadora_id, url)
select distinct on (site_oficial_url) id, site_oficial_url
from public.montadoras
where site_oficial_url is not null
order by site_oficial_url, slug
on conflict (url) do nothing;

-- Migration "monitor_fontes_padrao_tipo"
alter table public.monitor_fontes
  add column tipo text not null default 'pagina' check (tipo in ('pagina','sitemap')),
  add column padrao text;
comment on column public.monitor_fontes.padrao is 'Regex do caminho (minúsculo) que identifica página de modelo neste site; vazio = heurística padrão';

-- As fontes por marca (página de gama, sitemap declarado no robots.txt ou
-- portal de imprensa Stellantis) foram configuradas após inspeção de cada site
-- com a ação "inspecionar" da função monitorar-novidades.
