-- ═══════════════════════════════════════════════════════════════
-- 1) RAIO GEOGRÁFICO
--    Empresa define um raio padrão (aplicado a todas as vagas dela);
--    cada vaga pode sobrescrever com seu próprio raio.
--    Candidato tem localização própria (perfil) usada na busca "perto de mim".
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS raio_km_padrao integer,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

ALTER TABLE public.vagas
  ADD COLUMN IF NOT EXISTS raio_km integer;

COMMENT ON COLUMN public.profiles.raio_km_padrao IS 'Raio padrão (km) aplicado às vagas da empresa quando a vaga não define o próprio raio. Também usado como origem de busca "perto de mim" quando o candidato preenche latitude/longitude do perfil.';
COMMENT ON COLUMN public.vagas.raio_km IS 'Raio (km) de alcance desta vaga. Se nulo, herda profiles.raio_km_padrao da empresa; se a empresa também não definir, a aplicação usa um default fixo.';

-- ═══════════════════════════════════════════════════════════════
-- 2) NOTIFICAÇÃO DE CANDIDATURA (push + email pros dois lados)
--    In-app (tabela notificacoes) segue igual ao padrão já usado
--    pra "nova vaga" / "novo currículo". Push+email disparam via
--    webhook HTTP (pg_net) pra rota que já tem os helpers de
--    Resend/web-push no lado da aplicação.
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.notify_candidatura_nova()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_titulo text;
BEGIN
  SELECT titulo INTO v_titulo FROM public.vagas WHERE id = NEW.vaga_id;

  INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
  VALUES (
    NEW.empresa_id,
    'Nova candidatura' || COALESCE(': ' || v_titulo, ''),
    'Um candidato se aplicou pra sua vaga.',
    '/empresa/minhas-vagas'
  );

  INSERT INTO public.notificacoes (user_id, titulo, mensagem, link)
  VALUES (
    NEW.candidato_id,
    'Candidatura enviada' || COALESCE(': ' || v_titulo, ''),
    'Recebemos sua candidatura. Boa sorte!',
    '/candidato/candidaturas'
  );

  PERFORM net.http_post(
    url := 'https://www.vagasagora.com.br/api/public/hooks/notificar-candidatura',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (SELECT value FROM private.app_secrets WHERE name = 'cron_secret')
    ),
    body := jsonb_build_object('candidatura_id', NEW.id),
    timeout_milliseconds := 15000
  );

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_candidatura_nova() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_candidatura_nova ON public.candidaturas;
CREATE TRIGGER trg_notify_candidatura_nova
AFTER INSERT ON public.candidaturas
FOR EACH ROW EXECUTE FUNCTION public.notify_candidatura_nova();

-- ═══════════════════════════════════════════════════════════════
-- 3) CRON JOBS — corrige URLs mortas (sandbox Lovable antigo) e
--    agenda rotas que existiam mas nunca foram chamadas.
--    Todos autenticam com x-cron-secret == valor em private.app_secrets.
-- ═══════════════════════════════════════════════════════════════

DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobname FROM cron.job WHERE jobname IN (
    'vagasagora-gerar-post-diario',
    'vagasagora-gerar-posts-diario',
    'vagasagora-reindex-google-diario',
    'vagasagora-empresa-daily-diario'
  ) LOOP
    PERFORM cron.unschedule(j.jobname);
  END LOOP;
END $$;

SELECT cron.schedule(
  'vagasagora-gerar-posts-diario',
  '0 12 * * *', -- 12:00 UTC = 09:00 horário de Brasília
  $$
  SELECT net.http_post(
    url := 'https://www.vagasagora.com.br/api/public/cron/gerar-post?qtd=5',
    headers := jsonb_build_object(
      'x-cron-secret', (SELECT value FROM private.app_secrets WHERE name = 'cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);

SELECT cron.schedule(
  'vagasagora-reindex-google-diario',
  '30 12 * * *', -- 12:30 UTC = 09:30 horário de Brasília
  $$
  SELECT net.http_post(
    url := 'https://www.vagasagora.com.br/api/public/cron/reindex-google',
    headers := jsonb_build_object(
      'x-cron-secret', (SELECT value FROM private.app_secrets WHERE name = 'cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);

SELECT cron.schedule(
  'vagasagora-empresa-daily-diario',
  '0 13 * * *', -- 13:00 UTC = 10:00 horário de Brasília
  $$
  SELECT net.http_post(
    url := 'https://www.vagasagora.com.br/api/public/cron/empresa-daily',
    headers := jsonb_build_object(
      'x-cron-secret', (SELECT value FROM private.app_secrets WHERE name = 'cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);
