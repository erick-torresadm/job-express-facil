
-- Remover agendamentos antigos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vagasagora-gerar-post-diario') THEN
    PERFORM cron.unschedule('vagasagora-gerar-post-diario');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vagasagora-gerar-post-manha') THEN
    PERFORM cron.unschedule('vagasagora-gerar-post-manha');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'vagasagora-gerar-post-tarde') THEN
    PERFORM cron.unschedule('vagasagora-gerar-post-tarde');
  END IF;
END $$;

-- Manhã (08:00 BRT = 11:00 UTC)
SELECT cron.schedule(
  'vagasagora-gerar-post-manha',
  '0 11 * * *',
  $$
  SELECT net.http_get(
    url := 'https://project--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app/api/public/cron/gerar-post',
    headers := jsonb_build_object(
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZWZvZG54Z2h4cWtmZ3d2dG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzQ2ODcsImV4cCI6MjA5NDY1MDY4N30.jwAjsRg851_kHOIK-0vZ-KooqOqyYQqW9XJwI9abe90'
    ),
    timeout_milliseconds := 60000
  );
  $$
);

-- Tarde (18:00 BRT = 21:00 UTC)
SELECT cron.schedule(
  'vagasagora-gerar-post-tarde',
  '0 21 * * *',
  $$
  SELECT net.http_get(
    url := 'https://project--f540e22b-4e9f-464c-a652-5e61aa0a6160.lovable.app/api/public/cron/gerar-post',
    headers := jsonb_build_object(
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4ZWZvZG54Z2h4cWtmZ3d2dG9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNzQ2ODcsImV4cCI6MjA5NDY1MDY4N30.jwAjsRg851_kHOIK-0vZ-KooqOqyYQqW9XJwI9abe90'
    ),
    timeout_milliseconds := 60000
  );
  $$
);
