-- Toda segunda-feira às 10:23 UTC (07:23 em Brasília): lê os sites oficiais
-- das marcas e confere as páginas dos modelos do catálogo.
select cron.schedule(
  'monitorar-novidades-semanal',
  '23 10 * * 1',
  $$select interno.chamar_funcao('monitorar-novidades', '{}'::jsonb)$$
);
