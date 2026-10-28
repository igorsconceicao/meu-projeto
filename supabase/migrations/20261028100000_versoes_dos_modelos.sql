-- Versões de cada modelo, da de entrada (ordem 1) à topo de linha.
create table public.versoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete cascade,
  ordem smallint not null,
  nome text not null,
  nome_completo text,
  posicionamento text,
  motor text,
  cambio text,
  diferencial text,
  itens_adicionais text[] not null default '{}',
  base_comparacao text,
  multimidia text,
  iluminacao text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now(),
  unique (veiculo_id, nome)
);
create index versoes_veiculo_ordem on public.versoes (veiculo_id, ordem);

-- Resumo da linha de cada modelo: como a marca nomeia as versões e de onde veio a lista.
create table public.linhas_versoes (
  veiculo_id uuid primary key references public.veiculos(id) on delete cascade,
  nomenclatura text,
  observacoes text,
  evidencia text,
  fonte_url text not null,
  consultado_em date not null default current_date,
  confianca nivel_confianca not null default 'nao_confirmado',
  atualizado_em timestamptz not null default now()
);

comment on column public.versoes.ordem is '1 = versão de entrada; a maior = topo de linha';
comment on column public.versoes.itens_adicionais is 'O que esta versão acrescenta em relação à anterior, conforme a fonte';
comment on column public.versoes.base_comparacao is 'Nome da versão sobre a qual esta acrescenta os itens (vazio = itens de série ou destaques)';
comment on column public.versoes.diferencial is 'Em uma frase: o que distingue esta versão das demais';

do $$
declare t text;
begin
  foreach t in array array['versoes', 'linhas_versoes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Leitura pública" on public.%I for select using (true)', t);
    execute format('create policy "Inserção por autenticados" on public.%I for insert to authenticated with check (true)', t);
    execute format('create policy "Atualização por autenticados" on public.%I for update to authenticated using (true) with check (true)', t);
    execute format('create policy "Deleção por autenticados" on public.%I for delete to authenticated using (true)', t);
  end loop;
end $$;

-- Grava a linha de versões de um modelo de uma vez (upsert; a ordem do array é a ordem da entrada à topo).
-- Cada item: { nome, nome_completo?, posicionamento?, motor?, cambio?, diferencial?, itens?: [], sobre?,
--              multimidia?, iluminacao?, fonte?, confianca?, evidencia? }
create or replace function interno.gravar_versoes(
  p_slug text, p_nomenclatura text, p_observacoes text, p_fonte text,
  p_confianca nivel_confianca, p_evidencia text, p_versoes jsonb
) returns int
language plpgsql
as $$
declare
  v_id uuid;
  v_n int := 0;
  r jsonb;
begin
  select id into v_id from public.veiculos where slug = p_slug;
  if v_id is null then raise exception 'veículo % não encontrado', p_slug; end if;

  insert into public.linhas_versoes (veiculo_id, nomenclatura, observacoes, evidencia, fonte_url, consultado_em, confianca, atualizado_em)
  values (v_id, p_nomenclatura, p_observacoes, p_evidencia, p_fonte, current_date, p_confianca, now())
  on conflict (veiculo_id) do update set
    nomenclatura = excluded.nomenclatura, observacoes = excluded.observacoes, evidencia = excluded.evidencia,
    fonte_url = excluded.fonte_url, consultado_em = excluded.consultado_em, confianca = excluded.confianca,
    atualizado_em = now();

  for r in select value from jsonb_array_elements(p_versoes) loop
    v_n := v_n + 1;
    insert into public.versoes (veiculo_id, ordem, nome, nome_completo, posicionamento, motor, cambio, diferencial,
      itens_adicionais, base_comparacao, multimidia, iluminacao, evidencia, fonte_url, consultado_em, confianca, atualizado_em)
    values (v_id, v_n, r->>'nome', r->>'nome_completo', r->>'posicionamento', r->>'motor', r->>'cambio', r->>'diferencial',
      coalesce(array(select jsonb_array_elements_text(r->'itens')), '{}'), r->>'sobre', r->>'multimidia', r->>'iluminacao',
      coalesce(r->>'evidencia', p_evidencia), coalesce(r->>'fonte', p_fonte), current_date,
      coalesce((r->>'confianca')::nivel_confianca, p_confianca), now())
    on conflict (veiculo_id, nome) do update set
      ordem = excluded.ordem, nome_completo = excluded.nome_completo, posicionamento = excluded.posicionamento,
      motor = excluded.motor, cambio = excluded.cambio, diferencial = excluded.diferencial,
      itens_adicionais = excluded.itens_adicionais, base_comparacao = excluded.base_comparacao,
      multimidia = excluded.multimidia, iluminacao = excluded.iluminacao,
      evidencia = excluded.evidencia, fonte_url = excluded.fonte_url, consultado_em = excluded.consultado_em,
      confianca = excluded.confianca, atualizado_em = now();
  end loop;
  return v_n;
end $$;
revoke all on function interno.gravar_versoes(text, text, text, text, nivel_confianca, text, jsonb) from public, anon, authenticated;

-- Trecho de um texto guardado a partir da primeira ocorrência de uma palavra (para ler só o corpo da matéria).
create or replace function interno.trecho(p_id text, p_palavra text, p_tamanho int default 8000)
returns text language sql stable as $$
  select substr(texto, greatest(1, strpos(lower(texto), lower(p_palavra)) - 100), p_tamanho)
  from interno.textos_fonte where id = p_id;
$$;
revoke all on function interno.trecho(text, text, int) from public, anon, authenticated;
