-- Blindagem, parte 1 (aplicada em 2026-11-01)
-- 1) Papel de acesso guardado em app_metadata (só o administrador/servidor altera;
--    o próprio usuário não consegue se promover).
-- 2) Catálogo do site entregue por uma função que exige chave secreta do servidor
--    (a chave fica na tabela chaves_internas e na variável SITE_CHAVE_CATALOGO da
--    Vercel — nunca vai ao navegador).
-- 3) search_path fixo nas funções e índices nas chaves estrangeiras (avisos do Supabase).

update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"papel":"admin"}'::jsonb
 where email = 'igor@admin.local';

create or replace function public.papel_usuario()
returns text language sql stable set search_path = ''
as $$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'papel', '') $$;
revoke all on function public.papel_usuario() from public, anon;
grant execute on function public.papel_usuario() to authenticated;

insert into public.chaves_internas (nome, valor)
values ('site-catalogo', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (nome) do nothing;

create or replace function public.site_catalogo(p_chave text)
returns jsonb language plpgsql stable security definer set search_path = ''
as $function$
begin
  if p_chave is null or p_chave is distinct from (select valor from public.chaves_internas where nome = 'site-catalogo') then
    raise exception 'acesso negado' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'montadoras', (select coalesce(jsonb_agg(to_jsonb(m) order by m.nome), '[]'::jsonb) from public.montadoras m),
    'veiculos', (select coalesce(jsonb_agg(to_jsonb(v) || jsonb_build_object('montadora',
        case when m.id is null then null else jsonb_build_object('slug', m.slug, 'nome', m.nome, 'logotipo_url', m.logotipo_url, 'site_oficial_url', m.site_oficial_url) end)
        order by v.ano_modelo desc nulls last, v.data_lancamento_br desc nulls last, v.nome_comercial), '[]'::jsonb)
      from public.veiculos v left join public.montadoras m on m.id = v.montadora_id),
    'fichas_tecnicas', (select coalesce(jsonb_agg(to_jsonb(x) - 'evidencia' order by x.veiculo_id), '[]'::jsonb) from public.fichas_tecnicas x),
    'multimidias', (select coalesce(jsonb_agg(to_jsonb(x) - 'evidencia' order by x.veiculo_id), '[]'::jsonb) from public.multimidias x),
    'iluminacao', (select coalesce(jsonb_agg(to_jsonb(x) - 'evidencia' order by x.id), '[]'::jsonb) from public.iluminacao x),
    'palhetas', (select coalesce(jsonb_agg(to_jsonb(x) - 'evidencia' order by x.id), '[]'::jsonb) from public.palhetas x),
    'interruptores_vidro', (select coalesce(jsonb_agg(to_jsonb(x) - 'evidencia' order by x.id), '[]'::jsonb) from public.interruptores_vidro x),
    'versoes', (select coalesce(jsonb_agg(jsonb_build_object('id', x.id, 'veiculo_id', x.veiculo_id, 'ordem', x.ordem, 'nome', x.nome,
        'fonte_url', x.fonte_url, 'consultado_em', x.consultado_em, 'confianca', x.confianca) order by x.id), '[]'::jsonb) from public.versoes x)
  );
end $function$;
revoke all on function public.site_catalogo(text) from public;
grant execute on function public.site_catalogo(text) to anon, authenticated;

alter function public.fn_atualizar_timestamp() set search_path = public, extensions, pg_temp;
alter function interno.atualizar_segmentos_fenabrave() set search_path = public, extensions, pg_temp;
alter function interno.chamar_funcao(text, jsonb) set search_path = public, extensions, pg_temp;
alter function interno.gravar_versoes(text, text, text, text, public.nivel_confianca, text, jsonb) set search_path = public, extensions, pg_temp;
alter function interno.importar_segmentos_fenabrave(bigint, date, text, text) set search_path = public, extensions, pg_temp;
alter function interno.nome_segmento_fenabrave(text) set search_path = public, extensions, pg_temp;
alter function interno.pesquisar_midia(jsonb) set search_path = public, extensions, pg_temp;
alter function interno.trecho(text, text, integer) set search_path = public, extensions, pg_temp;
alter function interno.wm(text, integer) set search_path = public, extensions, pg_temp;

create index if not exists monitor_fontes_montadora_id_idx on public.monitor_fontes (montadora_id);
create index if not exists monitor_novidades_montadora_id_idx on public.monitor_novidades (montadora_id);
create index if not exists monitor_novidades_veiculo_id_idx on public.monitor_novidades (veiculo_id);
