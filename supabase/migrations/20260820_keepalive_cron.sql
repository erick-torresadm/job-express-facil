-- ═══════════════════════════════════════════════════════════════
-- KEEP-ALIVE — evita que o Supabase free pause o projeto por
-- inatividade (pausa automática depois de ~7 dias sem tráfego).
-- Faz uma chamada real na API REST do próprio projeto todo dia.
-- ═══════════════════════════════════════════════════════════════

SELECT cron.schedule(
  'vagasagora-keepalive-diario',
  '0 6 * * *', -- 06:00 UTC = 03:00 horário de Brasília
  $$
  SELECT net.http_post(
    url := 'https://amyyutqqavxjixlfzyov.supabase.co/rest/v1/profiles?select=id&limit=1',
    headers := jsonb_build_object(
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFteXl1dHFxYXZ4aml4bGZ6eW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjg2NTgsImV4cCI6MjEwMjc0NDY1OH0.t73m71AstT_Q3sBh-PhDJl7yP0nE0jE5OMyn0t0tvns'
    ),
    timeout_milliseconds := 15000
  );
  $$
);
