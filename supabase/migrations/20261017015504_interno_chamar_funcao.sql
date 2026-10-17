-- Chama qualquer Edge Function interna com a chave interna (uso restrito ao banco).
-- O Bearer é a chave pública (anon) do projeto; a autorização real é o x-chave-interna.
create or replace function interno.chamar_funcao(nome text, corpo jsonb default '{}'::jsonb)
returns bigint
language sql
as $function$
  select net.http_post(
    url := 'https://npmsgjpjfflawluyuisl.supabase.co/functions/v1/' || nome,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbXNnanBqZmZsYXdsdXl1aXNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMjYzMTAsImV4cCI6MjEwNzYwMjMxMH0.UfcDcGfOiAucE4vaqjywkVAIVOJGXQ1fy8WSD0_APpo',
      'x-chave-interna', (select valor from public.chaves_internas where nome = 'pesquisa-midia')
    ),
    body := corpo,
    timeout_milliseconds := 150000
  );
$function$;
revoke all on function interno.chamar_funcao(text, jsonb) from public, anon, authenticated;
