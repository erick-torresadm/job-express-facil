# Módulo Freelas — Vitrine de Autônomos no VagasAgora

Criar uma seção paralela ao módulo de vagas, focada em profissionais autônomos (designers, devs, fotógrafos, editores, social media, etc.) que precisam de uma **vitrine com portfólio** para captar clientes — inspirado em Vinteped/99freelas/Workana, mas mantendo a identidade e o propósito social do VagasAgora (gratuito por 2 anos na promoção).

## Posicionamento

Duas frentes convivendo no mesmo domínio, com navegação clara:

- **Vagas** (o que já existe): CLT, PJ, estágio — empresa contrata pessoa.
- **Freelas** (novo): cliente contrata serviço pontual OU descobre um profissional pela vitrine dele.

Diferencial vs concorrentes: **sem comissão sobre o serviço, sem leilão de preço, contato direto via WhatsApp**. Foco em vitrine + reputação, não em marketplace de leilão.

## Estrutura de páginas (rotas)

```text
/freelas                        → home do módulo (busca, categorias em destaque, top profissionais)
/freelas/categoria/$slug        → lista de profissionais por categoria (design, dev, foto, ...)
/freelas/p/$handle              → perfil público do profissional (vitrine + portfólio + contato)
/freelas/p/$handle/$projeto     → página de um projeto específico do portfólio
/freelas/servicos               → busca livre de serviços/gigs oferecidos
/freelas/servicos/$id           → detalhe de um "gig" (pacote de serviço com preço fixo)
/freelancer/onboarding          → wizard de criação do perfil freela (4 passos)
/freelancer/dashboard           → painel do profissional (edita perfil, projetos, gigs, mensagens)
/freelancer/portfolio           → gerenciar projetos do portfólio (upload de imagens)
/freelancer/gigs                → gerenciar pacotes de serviço
```

O painel de empresa/candidato existente não muda. Um mesmo usuário pode ter os dois papéis (candidato + freelancer).

## Funcionalidades principais

### 1. Perfil do freelancer (vitrine)
- Foto de capa + avatar, headline, bio, cidade, tags de skills
- Estrelas e depoimentos de clientes anteriores
- Galeria de projetos (fotos, descrição, cliente, link externo)
- Botão "Chamar no WhatsApp" (com mensagem pré-preenchida)
- Botão "Solicitar orçamento" (formulário → notifica freela)
- Badge "Verificado" (reaproveita fluxo de verificação já existente)
- Badge "Pro grátis na promoção" (reaproveita `promo_pro_ate`)
- URL amigável: `/freelas/p/joaosilva`

### 2. Gigs (pacotes de serviço com preço fixo)
- Título, categoria, descrição, preço a partir de, prazo, o que inclui
- Até 3 pacotes por gig (básico / intermediário / premium)
- Imagem de capa
- Botão "Contratar" → abre modal de briefing → cliente envia → notifica freela

### 3. Portfólio
- Cada projeto: título, descrição, imagens (até 8), cliente, ano, link, tags
- Página própria por projeto para compartilhar no LinkedIn/Instagram

### 4. Busca e descoberta
- Filtros: categoria, cidade, faixa de preço, nível (júnior/pleno/sênior), remoto/presencial, disponibilidade
- Ordenação: mais recentes, melhor avaliados, mais baratos
- Cards visuais grandes (mosaico estilo Behance/Dribbble), não lista textual

### 5. Reputação
- Avaliação por estrelas + comentário após contratação
- Contador de projetos entregues, tempo de resposta médio
- Depoimentos importados manualmente pelo freela (com nome do cliente) — moderação leve

### 6. Solicitação de orçamento
- Cliente sem cadastro pode enviar (captura nome + WhatsApp + descrição)
- Cliente logado envia com histórico
- Notificação: e-mail + push + item no dashboard do freela

### 7. Integração com o resto do site
- Bloco "Também é freela?" no dashboard do candidato → CTA pro onboarding freelancer
- Bloco "Precisa de um serviço pontual?" na home e no /vagas → CTA pro /freelas
- Menu principal ganha item "Freelas" ao lado de "Vagas"

## Promoção (mantém a mesma regra)

Durante a janela promocional (até 06/01/2027), todo perfil freelancer criado recebe **2 anos de Pro grátis**:
- Free: 1 gig, portfólio com até 3 projetos, sem destaque
- Pro (grátis na promo): gigs ilimitados, portfólio ilimitado, aparece no topo dos resultados, badge dourado, estatísticas de visualização

## Banco de dados (novas tabelas)

```text
freelancers            (perfil vitrine — 1:1 com auth.users)
  ├── handle, headline, bio, cover_url, avatar_url
  ├── categoria_principal, skills[], cidade, atende_remoto
  ├── nivel, disponibilidade, valor_hora_min
  ├── whatsapp, instagram, linkedin, site
  └── verificado, destaque, criado_em

freelancer_projetos    (portfólio)
  ├── freelancer_id, titulo, slug, descricao
  ├── cliente_nome, ano, link_externo, tags[]
  └── imagens[] (urls do storage)

freelancer_gigs        (pacotes)
  ├── freelancer_id, titulo, slug, categoria, descricao
  ├── capa_url, ativo
  └── pacotes jsonb (basic/inter/premium com preço, prazo, itens)

freelancer_orcamentos  (leads / pedidos)
  ├── freelancer_id, cliente_id (nullable), gig_id (nullable)
  ├── nome, whatsapp, email, descricao, orcamento_alvo
  ├── status (novo/respondido/fechado/perdido)
  └── criado_em

freelancer_avaliacoes  (reviews)
  ├── freelancer_id, autor_id (nullable), autor_nome
  ├── nota (1-5), comentario, projeto_id (nullable)
  ├── aprovada (bool — moderação)
  └── criado_em
```

Todas com RLS: leitura pública das colunas não-sensíveis; escrita apenas pelo dono (autor) — reaproveitando padrão de `curriculos`/`vagas`. GRANTs conforme padrão do projeto.

Um novo bucket de storage `freelas-portfolio` (público) para as imagens de projetos e capas.

## Detalhes técnicos

- Rotas seguem convenção TanStack Start: `freelas.tsx` layout + filhos.
- Server functions em `src/lib/freelas.functions.ts` com `requireSupabaseAuth` para escrita; leitura pública via server publishable client.
- SEO: cada perfil e projeto com `head()` próprio — `og:image` puxando a capa, JSON-LD `Person`/`Service`.
- Sitemap dinâmico incluído em `sitemap[.]xml.ts` (adiciona freelancers ativos + projetos).
- Upload de imagens via Supabase Storage, com compressão client-side (browser-image-compression já usado no projeto se disponível; senão adiciono).
- Página de perfil renderiza server-side para link compartilhável no LinkedIn/Instagram bater card bonito.
- Notificações reaproveitam tabela `notificacoes` + push já existentes.

## O que fica de fora desta primeira entrega

Para não estourar escopo, **não** entra agora (posso fazer em fases seguintes):
- Chat interno (por enquanto: WhatsApp + e-mail)
- Pagamento na plataforma / escrow (o combinado é direto entre freela e cliente — sem comissão, alinhado ao propósito)
- App mobile nativo (PWA cobre)
- Sistema de propostas/leilão em job posts (fica só a vitrine + gig fixo)

## Ordem sugerida de entrega (posso quebrar em turnos)

1. **Turno 1** — Migração de banco + tipos + estrutura de rotas vazia + item no menu.
2. **Turno 2** — Onboarding do freelancer + dashboard + gerenciar portfólio/gigs.
3. **Turno 3** — Páginas públicas (`/freelas`, categoria, perfil, projeto) com busca e filtros.
4. **Turno 4** — Orçamentos, avaliações, integração com dashboards existentes, SEO/sitemap.

## Dúvidas antes de começar

1. **Nome do módulo**: "Freelas", "Profissionais", "Autônomos" ou outro? Impacta URL e menu.
2. **Handle único**: já existe `u.$handle.tsx` (candidato). Uso o mesmo handle ou separo namespace `/freelas/p/`?
3. **Gigs (preço fixo)**: quer lançar com esse conceito ou começar só com vitrine + orçamento sob demanda?

Se preferir, respondo essas 3 durante a implementação com escolhas defensivas e sigo direto.
