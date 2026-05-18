
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  resumo text NOT NULL,
  conteudo text NOT NULL,
  cover_url text,
  autor text NOT NULL DEFAULT 'Equipe VagasAgora',
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  publicado boolean NOT NULL DEFAULT true,
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_posts_publicado_data ON public.posts (publicado, published_at DESC);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_public_select ON public.posts
  FOR SELECT USING (publicado = true);

CREATE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.posts (slug, titulo, resumo, conteudo, autor, tags) VALUES
('como-conseguir-emprego-rapido-sao-paulo',
 'Como conseguir emprego rápido em São Paulo (guia 2026)',
 'Passo a passo prático para arrumar trabalho em até 7 dias em SP, mesmo sem experiência. Vagas para pedreiro, doméstica, motorista, porteiro e mais.',
 E'## Por que tantas pessoas demoram pra arrumar emprego em SP\n\nNão é falta de vaga. É falta de **visibilidade**. Empresas que contratam para construção civil, limpeza, portaria e entregas recebem dezenas de currículos iguais, em papel ou em PDFs gigantes que ninguém abre.\n\n## O método em 4 passos\n\n1. **Tenha um currículo em vídeo ou áudio.** Recrutador entende em 30 segundos se você serve pra vaga.\n2. **Filtre por bairro.** Não adianta procurar vaga do outro lado da cidade.\n3. **Responda o WhatsApp na hora.** Quem responde primeiro, é chamado.\n4. **Repita 5 vagas por dia.** Em uma semana, alguém chama.\n\n## Profissões que mais contratam em São Paulo agora\n\n- Pedreiro e ajudante de obra\n- Empregada doméstica e diarista\n- Motorista de aplicativo e entregador\n- Porteiro e zelador\n- Auxiliar de cozinha\n\n## Como o VagasAgora ajuda\n\nVocê grava um vídeo de 30 segundos, escolhe seu bairro, e recebe vagas no WhatsApp. **Sem taxa, sem cadastro chato, sem precisar saber escrever bem.**',
 'Equipe VagasAgora',
 '["emprego", "são paulo", "guia"]'::jsonb),
('curriculo-em-video-como-fazer',
 'Currículo em vídeo: como fazer um que chama atenção do recrutador',
 'Aprenda a gravar um currículo em vídeo de 30 segundos que aumenta em 4x suas chances de ser chamado para entrevista.',
 E'## Por que vídeo funciona melhor que PDF\n\nRecrutador de vaga operacional (pedreiro, doméstica, motorista) não tem tempo de ler currículo. Ele quer **ouvir você falar** e ver se você tem jeito.\n\n## O roteiro perfeito de 30 segundos\n\n1. **Nome e profissão** (5s) — "Oi, meu nome é João, sou pedreiro."\n2. **Experiência principal** (10s) — "Trabalhei 4 anos numa construtora em Guarulhos."\n3. **O que sabe fazer** (10s) — "Faço alvenaria, reboco, contrapiso e acabamento."\n4. **Quando pode começar** (5s) — "Posso começar segunda-feira."\n\n## Dicas de gravação\n\n- Fundo claro e parede limpa\n- Celular na altura dos olhos\n- Fala devagar e olha pra câmera\n- Não precisa de roupa social: limpo e organizado já basta\n\n## O que NÃO fazer\n\n- Vídeo de mais de 1 minuto\n- Música de fundo\n- Filtros e efeitos\n- Falar mal de antigo chefe',
 'Equipe VagasAgora',
 '["currículo", "vídeo", "dicas"]'::jsonb),
('vagas-domestica-perto-de-mim',
 'Vagas de doméstica perto de mim: como encontrar trabalho no seu bairro',
 'Guia completo para diaristas e empregadas domésticas encontrarem trabalho perto de casa, com salário justo e carteira assinada.',
 E'## O problema da distância\n\nAceitar uma vaga de doméstica longe de casa significa **2 a 4 horas de transporte por dia** e gasto alto com ônibus. Não compensa.\n\n## Onde estão as vagas perto de você\n\nBairros de classe média e alta concentram a maioria das vagas — Moema, Pinheiros, Vila Mariana, Tatuapé, Santana em São Paulo. Mas tem demanda em todo bairro.\n\n## Faixa salarial em 2026\n\n- **Diarista:** R$ 180 a R$ 250 por dia\n- **Mensalista (5x semana):** R$ 1.800 a R$ 2.800 + benefícios\n- **Babá:** R$ 2.200 a R$ 3.500\n- **Cuidadora de idosos:** R$ 2.000 a R$ 3.200\n\n## Direitos que você precisa exigir\n\n- Carteira assinada se trabalhar 3+ dias por semana\n- Vale-transporte\n- 13º salário e férias\n- FGTS\n\n## Como usar o VagasAgora\n\nCadastre-se grátis, escolha seu bairro, grave um áudio falando sua experiência. Quando uma família do seu bairro buscar diarista ou mensalista, **você cai na lista**.',
 'Equipe VagasAgora',
 '["doméstica", "diarista", "emprego"]'::jsonb);
