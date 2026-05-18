
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove agendamento anterior se existir
SELECT cron.unschedule('vagasagora-gerar-post-diario')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vagasagora-gerar-post-diario');

-- Agenda: todo dia às 11:00 UTC (08:00 horário de Brasília)
SELECT cron.schedule(
  'vagasagora-gerar-post-diario',
  '0 11 * * *',
  $$
  SELECT net.http_get(
    url := 'https://project--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app/api/public/cron/gerar-post',
    headers := jsonb_build_object(
      'x-cron-secret', current_setting('app.settings.service_role_key', true)
    ),
    timeout_milliseconds := 60000
  );
  $$
);
