-- O catálogo só é chamado pelo servidor do site (papel anon + chave secreta).
-- Usuário logado não precisa chamá-lo direto: menos uma porta aberta.
revoke execute on function public.site_catalogo(text) from authenticated;
