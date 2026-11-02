-- Blindagem, parte 2: o banco só entrega dados para quem entrou no site com um
-- usuário liberado. Antes: qualquer pessoa com a chave pública (que vai dentro
-- de toda página) lia tudo, e qualquer conta criada podia gravar.
--
--   visitante sem login (anon) ........ nada
--   conta sem papel ................... nada
--   papel "leitor" .................... só leitura
--   papel "admin" ..................... leitura e escrita
--   rotinas automáticas (service role)  sem mudança

do $$
declare
  t text;
  p record;
begin
  foreach t in array array[
    'conferencias_ranking', 'diario_bordo', 'emplacamentos', 'emplacamentos_segmentos',
    'fichas_tecnicas', 'iluminacao', 'interruptores_vidro', 'linhas_versoes',
    'monitor_fontes', 'monitor_novidades', 'montadoras', 'multimidias', 'palhetas',
    'participacao_segmentos', 'veiculos', 'versoes'
  ] loop
    for p in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
      execute format('drop policy %I on public.%I', p.policyname, t);
    end loop;
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('revoke truncate, references, trigger on public.%I from authenticated', t);
    execute format($p$create policy "leitura com papel" on public.%I for select to authenticated
                    using ((select public.papel_usuario()) in ('admin', 'leitor'))$p$, t);
    execute format($p$create policy "admin insere" on public.%I for insert to authenticated
                    with check ((select public.papel_usuario()) = 'admin')$p$, t);
    execute format($p$create policy "admin altera" on public.%I for update to authenticated
                    using ((select public.papel_usuario()) = 'admin') with check ((select public.papel_usuario()) = 'admin')$p$, t);
    execute format($p$create policy "admin exclui" on public.%I for delete to authenticated
                    using ((select public.papel_usuario()) = 'admin')$p$, t);
  end loop;
end $$;

-- Painel de atividade (view com security_invoker: segue as regras acima).
revoke all on public.atividade_diaria from anon;
revoke insert, update, delete, truncate, references, trigger on public.atividade_diaria from authenticated;

-- Chaves internas: só o servidor (service role) e funções do próprio banco.
revoke all on public.chaves_internas from anon, authenticated;

-- Função de gatilho não precisa ser chamável pela API.
revoke execute on function public.fn_atualizar_timestamp() from public, anon, authenticated;

-- Tabelas e funções criadas no futuro já nascem fechadas para visitantes.
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke execute on functions from public, anon;
