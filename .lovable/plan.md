
## 1. Bloco "Para profissionais / Para empresas" (index) — corrigir
O botão **"Falar com o time comercial"** aponta pra `/auth`, sem passar pela página de empresas. Alterar para `/para-empresas` (com âncora no formulário). Também garantir que o card "Para profissionais" (CTA `Criar meu perfil`) leve para `/cadastro?tipo=candidato` pra pré-selecionar o tipo. Sem outras mudanças visuais no bloco.

## 2. Promoção ativa → preços zerados em `/planos` e `/para-empresas`
Enquanto `isPromoAtiva()` for `true` (até 06/01/2027):
- Todos os cards de plano (Grátis, Básico, Full, e planos de candidato) mostram **"R$ 0"** com o preço original riscado ao lado e uma tag **"Grátis por 2 anos na promoção de lançamento"**.
- CTA principal muda para **"Ativar Pro grátis"** em vez de "Assinar".
- Ao clicar, se logado, chama uma nova server function `ativarPromoPro()` que confere `isPromoAtiva()`, seta `profiles.promo_pro_ate = now() + 2 years` e redireciona pro dashboard.
- Fluxo de pagamento Asaas fica **desabilitado** enquanto a promo estiver ativa (botão substitui a chamada; nada é cobrado).
- Quando a promo terminar automaticamente (data), os preços originais voltam sem nova migração.

## 3. Engajamento diário — email + push para EMPRESAS
Objetivo: fazer a empresa cadastrada voltar ao site diariamente.

**Backend (nova tabela + cron):**
- Tabela `empresa_daily_digest` (log de envio por empresa/dia) pra não duplicar.
- Server route pública `/api/public/cron/empresa-daily` protegida por `CRON_SECRET` — roda 1x/dia via pg_cron.
- Pra cada empresa (`user_roles.role = 'empresa'`):
  - Monta um digest com: nº de novos candidatos compatíveis com as vagas dela nas últimas 24h, top 3 currículos novos (nome, profissão, cidade, link `/cv/:slug`), lembrete de "publique nova vaga" se não publicou em 7 dias, e recado da promoção Pro grátis.
  - **Push**: se tem `push_subscriptions` do user_id, dispara via `sendPushBatch` (`notifyAdminsPush` já existe como padrão, criar `notifyEmpresaPush`).
  - **Email**: usa infra Lovable Emails (`enqueue_email` → template React Email `EmpresaDigestEmail`). Se ainda não há domínio de email configurado, `email_domain--check_email_domain_status` primeiro; se `no_domain`, mostro o setup dialog antes de instalar o cron.
- Frequência: **diária** às 9h BRT, com "opt-out" via link no rodapé do email (`profiles.digest_opt_out boolean default false`).

**Frontend:**
- No dashboard da empresa, toggle "Receber resumo diário por email/push" ligado por padrão.

## 4. Página `/vagas` completa + "pular cadastro"
- `/vagas` já existe (`vagas.index.tsx`) com `VagasPublicListing`. Reforçar como página principal de busca:
  - Filtros topo: cidade (autocomplete), regime (CLT/PJ/Estágio/Diária), faixa salarial, remoto/presencial, nível.
  - Ordenar por: mais recente, mais próximo, maior salário.
  - Cards com "match %" quando o candidato está logado (usa currículo); quando não, esconde.
  - Paginação infinita / "carregar mais".
  - Bloco fixo "Salvar essa busca como alerta" (usa tabela `alertas`).
- **"Pular cadastro" no fluxo do candidato:** no `/cadastro?tipo=candidato` adicionar link secundário **"Só quero olhar as vagas primeiro →"** que leva direto pra `/vagas`. No `/vagas`, ao clicar em "Candidatar-se", se não estiver logado, modal: "Pra candidatar em 1 clique crie seu perfil (60s)" com opção "Continuar sem cadastro (WhatsApp da empresa)" que revela o link direto quando a empresa permite.
- Botão persistente no topo de `/vagas`: "Criar perfil e receber vagas no WhatsApp" (não bloqueante).

## 5. Up nos dashboards (empresa + candidato) — sugestões

### Dashboard EMPRESA (`/empresa`)
Adicionar/redesenhar:
- **Header com métricas** em 4 cards: Vagas ativas, Candidaturas nos últimos 7 dias, Visualizações do perfil da empresa, Taxa de resposta (WhatsApp).
- **Gráfico** (recharts) de candidaturas/dia últimos 30 dias.
- **"Pipeline" por vaga** (kanban leve): Novas → Em contato → Entrevista → Contratada / Descartada. Drag-and-drop simples.
- **"Candidatos recomendados hoje"** — top 5 currículos que batem com as vagas ativas (mesma lógica do digest).
- **Alerta topo**: "Sua última vaga tem X dias sem novos candidatos — reforce a descrição" (heurística simples).
- Design: usar as cores/tokens já existentes, sidebar `AdminShell`-like com ícones, dark mode consistente, cards com `shadow-soft` e `rounded-3xl`.

### Dashboard CANDIDATO (`/candidato`)
Adicionar/redesenhar:
- **Header** com "Força do perfil" (percent circular usando `CVProgressMeter`), badge "Pro grátis até dd/mm/aaaa".
- **Cards de métrica**: Vagas compatíveis novas hoje, Empresas que viram seu perfil (7d), Candidaturas em andamento, Convites recebidos.
- **Feed "vagas pra você hoje"** — 5 vagas com match %, botão "candidatar em 1 clique".
- **Timeline de candidaturas** com status: Enviada → Vista → Em conversa → Entrevista → Resultado.
- **Sugestão diária** ("adicione portfólio", "grave seu vídeo de 30s", "confirme WhatsApp") — checklist gamificado (`CVProgressMeter` já tem base).
- **Alertas salvos** em destaque com contador de novas vagas.

## Detalhes técnicos

**Arquivos a criar:**
- `src/lib/promo.functions.ts` — `ativarPromoPro()` (protegida por `requireSupabaseAuth`).
- `src/lib/empresa-digest.server.ts` — monta digest.
- `src/routes/api/public/cron/empresa-daily.ts` — endpoint cron.
- `src/emails/EmpresaDigestEmail.tsx` — template React Email.
- `src/components/dashboard/EmpresaOverview.tsx` + `CandidatoOverview.tsx` + `PipelineKanban.tsx` + `MetricCard.tsx`.
- Nova migração: coluna `profiles.digest_opt_out`, tabela `empresa_daily_digest(empresa_id, sent_at, kind)`.

**Arquivos a editar:**
- `src/routes/index.tsx` — links do bloco ParaQuem.
- `src/routes/planos.tsx` — preços R$ 0 quando `isPromoAtiva()`.
- `src/routes/para-empresas.tsx` — mesmo tratamento onde mostra preço.
- `src/routes/cadastro.tsx` — link "pular cadastro" pra `/vagas`.
- `src/routes/vagas.index.tsx` + `VagasPublicListing.tsx` — filtros extras, modal de candidatura sem login.
- `src/routes/empresa.tsx` + `src/routes/empresa.minhas-vagas.tsx` — novo overview + pipeline.
- `src/routes/candidato.index.tsx` — novo overview.

**Cron:** agendado via pg_cron chamando o endpoint público com header `x-cron-secret`.

**Email domain:** se ainda não configurado, o setup do domínio é pré-requisito e será solicitado antes de ativar o digest.

## Ordem de execução
1. Fix rápido do bloco index (2 links).
2. Preços zerados na promo (planos + para-empresas + server fn `ativarPromoPro`).
3. Página `/vagas` completa + fluxo "pular cadastro".
4. Dashboards redesenhados (empresa e candidato).
5. Digest diário (migração → email template → cron → toggle no dashboard).

Confirma que quer tudo isso em uma leva só? Se preferir posso fazer nessa ordem em 2–3 turnos pra você ir validando.
