-- Monitoramento de novidades passa a rodar nos dias 1 e 15 de cada mês
-- (10:23 UTC = 07:23 em Brasília), conforme pedido do usuário.
select cron.unschedule('monitorar-novidades-semanal');
select cron.schedule(
  'monitorar-novidades-quinzenal',
  '23 10 1,15 * *',
  $$select interno.chamar_funcao('monitorar-novidades', '{}'::jsonb)$$
);
