create extension if not exists pg_cron;

-- Importa o informativo mais recente da Fenabrave uma vez por dia entre os dias
-- 1 e 15 de cada mês (período em que o PDF do mês anterior é publicado). A
-- gravação é idempotente (upsert por período/tipo/segmento/posição).
select cron.schedule(
  'importar-fenabrave-mensal',
  '17 11 1-15 * *',
  $$select interno.chamar_funcao('importar-fenabrave', '{}'::jsonb)$$
);
