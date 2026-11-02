-- Cadastro fechado: ninguém cria conta pelo site ou pela API pública.
-- Novos usuários só pelo administrador, direto no banco, liberando antes na
-- mesma transação:  select set_config('app.liberar_novo_usuario', 'sim', true);
-- (o desligamento oficial de cadastro fica no painel do Supabase; esta trava
-- garante o mesmo efeito mesmo que a opção esteja ligada lá).
create or replace function interno.bloquear_cadastro_aberto()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('app.liberar_novo_usuario', true), '') <> 'sim' then
    raise exception 'Cadastro fechado: novos usuários são criados só pelo administrador.'
      using errcode = '42501';
  end if;
  return new;
end $$;

revoke all on function interno.bloquear_cadastro_aberto() from public, anon, authenticated;

drop trigger if exists bloquear_cadastro_aberto on auth.users;
create trigger bloquear_cadastro_aberto
  before insert on auth.users
  for each row execute function interno.bloquear_cadastro_aberto();
