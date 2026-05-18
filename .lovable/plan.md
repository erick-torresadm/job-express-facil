## Visão geral

Adicionar uma camada social ao VagasAgora onde candidatos **e** empresas têm perfil público com foto, postam textos curtos, curtem/comentam, seguem uns aos outros e conversam no privado. Moderação via botão "denunciar" + revisão no painel admin.

Vou entregar em **4 fases** pra você poder testar e dar feedback entre cada uma, em vez de despejar tudo de uma vez.

---

## Fase 1 — Perfil social (base)

**Banco:**
- Tabela `profiles` ganha: `avatar_url`, `cover_url`, `bio_social` (text 500 chars), `handle` (@usuario único)
- Bucket público `social-media` para fotos/capas
- Tabela `follows`: quem segue quem (user_id → user_id)

**Frontend:**
- Rota `/perfil/@handle` — página pública estilo Twitter/LinkedIn (foto, capa, bio, botão seguir, contadores)
- Rota `/perfil` (logado) — edita avatar, capa, bio, handle
- Botão "Seguir" com contador

## Fase 2 — Feed de posts

**Banco:**
- Tabela `posts_social` (text até 500 chars, sem mídia pra não pesar)
- Tabela `likes` (post_id, user_id)
- Tabela `comments` (post_id, user_id, conteudo)
- Realtime habilitado em likes/comments

**Frontend:**
- Rota `/feed` — timeline de quem você segue + populares
- Caixa "o que você quer compartilhar?" no topo (max 500 chars)
- Card de post com curtir, comentar, compartilhar
- Drawer de comentários

## Fase 3 — Mensagens privadas (DM)

**Banco:**
- Tabela `conversas` (par de user_ids)
- Tabela `mensagens` (conversa_id, autor_id, texto, lida)
- Realtime nas mensagens (canal por conversa)
- RLS estrita: só os 2 participantes leem

**Frontend:**
- Rota `/mensagens` — lista de conversas
- Rota `/mensagens/$userId` — chat 1:1 em tempo real
- Botão "Enviar mensagem" no perfil público
- Badge no header com não lidas

## Fase 4 — Moderação

**Banco:**
- Tabela `denuncias` (tipo: post/comentário/perfil/mensagem, target_id, motivo, status)
- Admin pode ocultar post / suspender usuário

**Frontend:**
- Botão "⚠️ Denunciar" em cada post/comentário/perfil
- Rota `/admin/denuncias` — fila de revisão pro admin
- Posts/perfis ocultos não aparecem mais no feed

---

## Decisões técnicas

- **Sem upload de imagem em posts** (só texto): economiza ~80% do storage e CPU. Você pediu "só textos para não pesar".
- **Avatars/capas**: bucket público, URL direta no perfil. 1 imagem por usuário cada (substitui).
- **Realtime**: só em mensagens privadas e contadores de notificação. Feed atualiza via refetch on focus (mais barato).
- **Rate limit**: max 10 posts/dia, 50 comentários/dia, 100 mensagens/dia por usuário — protege contra spam.
- **RLS rigorosa em mensagens**: a fase 3 só sobe quando eu confirmar que ninguém consegue ler conversa alheia.
- **Sem grupos, sem stories, sem repost** — escopo mínimo viável.

## Riscos que você precisa saber

1. **LGPD**: posts e mensagens são dados pessoais. Precisa de termo de uso + política de privacidade atualizada antes de lançar (eu adiciono os textos básicos).
2. **Moderação manual escala mal**: até ~500 usuários ativos ok. Acima disso vai precisar de IA filtrando. Vou deixar o gancho pronto.
3. **Custo de banco**: cada post + like + comment + msg = linha nova. Em 6 meses pode passar do plano gratuito. Vou usar índices certos pra não explodir.

---

## O que vou fazer AGORA se você aprovar

Começar pela **Fase 1** (perfil social + follow): cria as tabelas, bucket, edição de perfil, página pública @handle, botão seguir. Roda ~15min e você consegue testar. Depois disso, te aviso e seguimos pra Fase 2 (feed).

Se você quiser pular pra alguma fase ou cortar algo, é só falar antes da aprovação.