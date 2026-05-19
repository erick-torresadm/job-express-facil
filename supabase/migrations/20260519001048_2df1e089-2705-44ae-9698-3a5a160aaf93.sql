CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Remove agendamentos antigos com o mesmo nome (idempotente)
DO $$
BEGIN
  PERFORM cron.unschedule('vagasagora-gerar-posts-diario');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'vagasagora-gerar-posts-diario',
  '0 12 * * *', -- 12:00 UTC = 09:00 horário de Brasília
  $$
  SELECT net.http_get(
    url := 'https://project--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app/api/public/cron/gerar-post?qtd=5',
    headers := jsonb_build_object(
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZWZvZG54Z2h4cWtmZ3d2dG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzQ2ODcsImV4cCI6MjA5NDY1MDY4N30.jwAjsRg851_kHOIK-0vZ-KooqOqyYQqW9XJwI9abe90'
    )
  ) AS request_id;
  $$
);