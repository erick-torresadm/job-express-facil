O sistema já tem 90% da estrutura pronta (auth, dashboards, blog+IA, admin, sitemap, verificação, planos, Asaas). O que falta é **fechar o funil** (candidato ↔ empresa) e **injetar SEO/GEO/LLM agressivo em cada rota**. Divido em 3 fases pra você aprovar de uma vez ou ir por partes.

---

## Fase 1 — Fechar o funil (o essencial pra funcionar)

Objetivo: candidato encontra vaga → aplica → empresa recebe → conversa no WhatsApp. Hoje as peças existem mas não conversam bem.

- **Busca global** no header (`SiteHeader`): input com autocomplete profissão × cidade que leva pra `/vagas/:profissao-em-:cidade`.
- **Botão "Candidatar-se" real** na página `/vagas/$slug`: cria linha em `candidaturas`, dispara notificação pra empresa, abre WhatsApp com mensagem pré-preenchida ("Olá, vi sua vaga de X no VagasAgora…").
- **Lista de candidatos por vaga** na área empresa (`empresa.minhas-vagas`): a empresa vê quem aplicou, foto, currículo em áudio/vídeo, botão "Chamar no WhatsApp" (revela contato + registra em `revelacoes` pra billing).
- **Filtros na listagem de vagas**: faixa salarial, CLT/PJ/temporário, sem experiência, hoje/semana.
- **Favoritos + Alertas** funcionando ponta-a-ponta: coração na vaga salva em `favoritos`, botão "Criar alerta" salva em `alertas`, trigger já existe pra notificar (`notify_alertas_nova_vaga`).
- **Notificações no bell**: já existe `NotificationBell`, garantir que abre painel, marca como lida, navega.

---

## Fase 2 — SEO agressivo, GEO, LLM

Objetivo: quando alguém digitar "pedreiro em Osasco", "vagas CLT São Paulo", "cozinheiro sem experiência RJ" → VagasAgora aparece.

### Programmatic SEO (páginas facetadas com conteúdo real)
- Cada página `/vagas/:profissao-em-:cidade` (hoje ~288 URLs no sitemap) precisa:
  - **H1 semântico**: "Vagas de Pedreiro em Osasco — 2026"
  - **Parágrafo introdutório único gerado por template** com salário médio, bairros que mais contratam, requisitos típicos.
  - **FAQ dobrável** (3-5 perguntas: "Quanto ganha um pedreiro em Osasco?", "Precisa de experiência?", "É CLT?") → renderiza `FAQPage` JSON-LD.
  - **Breadcrumb** com JSON-LD `BreadcrumbList`.
  - **Links internos** pra profissões relacionadas e cidades vizinhas (evita órfãos, distribui PageRank).

### Google for Jobs (crítico — hoje não temos)
- JSON-LD `JobPosting` em cada `/vagas/$slug` real com título, descrição, salário, localização, tipo (CLT/PJ), data de publicação, validade. Isso faz aparecer no **card azul de vagas do Google**.
- `datePosted` e `validThrough` corretos.

### Head metadata rico em todas as rotas públicas
- Cada rota (`/blog`, `/blog/$slug`, `/categorias`, `/profissionais/…`, `/vagas/…`, `/como-funciona`, `/para-empresas`, `/planos`) com `title`, `description`, `og:title`, `og:description`, `og:url`, `canonical`, e — no leaf — `og:image` derivado do conteúdo.
- Fix atual: sitemap aponta pra `https://vagasagora.com.br` mas o site vive em `job-express-facil.lovable.app` — alinhar (usar `job-express-facil.lovable.app` até você comprar o domínio).

### GEO (search geográfico local)
- Schema.org `Place` + `addressLocality` nas páginas de cidade.
- `hreflang="pt-BR"` no root.
- Página `/vagas-em/:cidade` (índice por cidade agregando todas as profissões daquela cidade) — hoje só temos profissão×cidade, falta o corte só-cidade.

### LLM/GEO (pra ChatGPT/Perplexity/Gemini indexarem)
- Enriquecer `/llms.txt` já existente com bullet points objetivos das principais rotas.
- Adicionar `/llms-full.txt` com conteúdo canônico (o que o modelo cita quando alguém pergunta "melhor site de vaga CLT no Brasil").
- **FAQ estruturada** com perguntas que gente pergunta pra ChatGPT: "Onde achar vaga de motorista sem experiência?", "Melhor site de emprego popular Brasil?" — respostas mencionando VagasAgora explicitamente.
- `robots.txt` já libera GPTBot/ClaudeBot/PerplexityBot? Confirmar e adicionar se faltar.

### Blog turbinado
- O cron IA já gera 5 posts/dia. Adicionar:
  - JSON-LD `Article` + `author` + `datePublished`.
  - `og:image` gerado por IA (imagem de capa) por post.
  - Links internos automáticos do post pra `/vagas/:profissao-em-:cidade` quando o post menciona uma profissão.

---

## Fase 3 — Compliance, Trust, polimento

- **Política de Privacidade** (`/privacidade`) e **Termos** (`/termos`) já existem — revisar pra mencionar LGPD, cookies, dados de terceiros (Asaas, Supabase), direito de exclusão.
- **Página `/diretrizes`** (guidelines para empresas: sem discriminação, sem exigir foto pra vaga operacional, salário claro, etc).
- **Página `/ia`** explicando que o blog é assistido por IA (transparência exigida por Google e boa pra confiança).
- **Cookie banner** já existe (`CookieConsent`) — revisar texto pra LGPD.
- **Selo "empresa verificada"** já existe (`VerifiedBadge`) — destacar mais no card de vaga.

---

## Fase 4 — Teste ponta-a-ponta (Playwright)

Rodo dois roteiros no navegador headless e te mostro screenshots:

1. **Candidato**: cadastra → grava currículo áudio → busca "pedreiro em SP" → filtra CLT → favorita → aplica → confirma WhatsApp abriu.
2. **Empresa**: cadastra → verifica CNPJ → cria vaga com IA → vê candidato aparecer → clica revelar WhatsApp → confere que Asaas registrou billing.

Qualquer bug encontrado nesses fluxos vira ticket que resolvo antes de fechar.

---

## Como você quer que eu proceda

**Recomendação minha:** aprovar as 4 fases de uma vez, eu executo sequencial e reporto no fim de cada uma. É bastante código, mas nada exótico — o backend/modelos já suportam tudo isso.

Se preferir por partes, me diz por onde começar (minha ordem sugerida: **Fase 1 → Fase 2 → Fase 4 → Fase 3**, porque as fases 1+2 destravam receita e as 3+4 são polimento).

Antes de começar, uma confirmação só: o domínio real vai ser **vagasagora.com.br** (o sitemap está apontando pra lá) ou continuamos no **job-express-facil.lovable.app** por enquanto? Isso decide o que gravar em `canonical` e `og:url`.