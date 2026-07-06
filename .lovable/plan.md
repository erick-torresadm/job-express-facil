## Direção travada

- **Paleta Ocean**: `#0c2340` (deep) · `#1a4a6e` (surface) · `#2d8a9e` (primary) · `#5cbdb9` (accent) — aplicada como tokens semânticos em `src/styles.css` (light + dark), sem trocar as cores do resto do site.
- **Tipografia**: Sora nos títulos, Manrope no corpo (via `<link>` no `__root.tsx`, seguindo a regra do stack; nada de `@import` de URL em `styles.css`).
- **Layout**: Sidebar persistente com mini-collapse (ícones), usando `shadcn/ui sidebar` — nada de tirar o usuário do site em nenhum momento.

## Arquitetura da nova área do candidato

Uma rota-mãe protegida com layout próprio + rotas filhas para cada seção — hoje tudo está numa única tela de tabs, o que dificulta bookmark, back button e navegação lateral.

```
src/routes/
  _candidato.tsx                   (layout: sidebar + header + <Outlet />)
  _candidato.index.tsx             → /candidato          (Painel/Home)
  _candidato.vagas.tsx             → /candidato/vagas    (Vagas recomendadas p/ você)
  _candidato.candidaturas.tsx      → /candidato/candidaturas
  _candidato.salvas.tsx            → /candidato/salvas
  _candidato.alertas.tsx           → /candidato/alertas
  _candidato.curriculo.tsx         → /candidato/curriculo
  _candidato.perfil.tsx            → /candidato/perfil
```

O arquivo atual `src/routes/candidato.tsx` vira um redirect leve para `/candidato` (mantém links antigos) e some depois.

### Sidebar (AppSidebarCandidato)

- Logo VagasAgora no topo · seções agrupadas: **Painel · Vagas · Minhas candidaturas · Salvas · Alertas · Currículo · Perfil**.
- Rota ativa via `useRouterState`; badge de contagem em Candidaturas/Salvas/Alertas.
- Colapsa para tira de ícones em desktop (`collapsible="icon"`), vira `Sheet` off-canvas em mobile.
- Rodapé: avatar + nome + botão “Sair”. **Nunca** links externos.

### Header do layout

- `SidebarTrigger` sempre visível + breadcrumb da seção atual + busca rápida de vagas (dispara `/candidato/vagas?q=`) + sino de notificações.

## Página “Painel” (`/candidato`)

Substitui a tela atual de KPIs pobres por um resumo acionável:

1. **Boas-vindas compacta** com avatar, nome e progresso do CV (barra Manrope) — se CV incompleto, CTA “Completar em 1 min”.
2. **3 métricas grandes** (Candidaturas ativas · Salvas · Alertas), cada uma clicável levando à seção.
3. **Card “Continue candidatando”** com as 3 últimas vagas vistas (do histórico) — botão “Candidatar em 1 clique”.
4. **Card “Novas para você”**: 5 vagas recomendadas por profissão/cidade do perfil, mesmo componente reusado em `/candidato/vagas`.
5. **Timeline “Última atividade”**: 5 eventos (candidatura enviada, status mudou, alerta disparado) — realtime já existe em `candidaturas`.

## Página “Vagas para você” (`/candidato/vagas`)

Foco em **visualização fácil**, sem cara de IA:

- Barra de filtros sticky: cidade, profissão, modelo (CLT/PJ/diária), faixa salarial, distância. Chips removíveis abaixo.
- **VagaCard** redesenhado (componente novo `src/components/VagaCard.tsx`):
  - Coluna esquerda: logo/inicial da empresa (avatar Ocean).
  - Centro: título Sora bold + empresa · bairro/cidade + salário destacado em `--primary` + tags (CLT, presencial, urgente) em pílulas neutras.
  - Direita: botão sólido **Candidatar** + ícone coração para salvar + selo “Nova” se `created_at < 24h`.
  - Estado "já candidatada" mostra pílula verde em vez do botão.
- Grid responsivo: 1 coluna mobile, 2 em `md`, 3 em `xl`. Skeleton com shimmer enquanto carrega.
- Empty state com ilustração leve (SVG inline) + CTA “Ativar alerta”.

## Minhas candidaturas (`/candidato/candidaturas`)

- Filtro por status (Enviada · Vista · Em análise · Finalizada) como segmented control.
- Cards com PipelineBar mais legível (4 passos rotulados, não só barras coloridas).
- Ação secundária “Ver conversa” quando houver mensagem da empresa (usa notificações já existentes).

## Salvas, Alertas, Currículo, Perfil

- **Salvas**: mesmo `VagaCard`; remove com swipe/ícone; badge “Encerrada” quando `ativa=false`.
- **Alertas**: form em card destacado no topo; lista compacta com toggle e delete inline.
- **Currículo**: preview do CV público + botões “Editar dados”, “Regravar áudio”, “Copiar link público”, “Baixar PDF”.
- **Perfil**: absorve o que hoje está em `/perfil` (avatar, handle, dados básicos, endereço, notificações push toggle) — usuário nunca precisa sair do painel.

## Design system (tokens novos em `src/styles.css`)

Adiciono um bloco `@theme inline` só para o painel do candidato, escopo `.theme-ocean`, aplicado no `<div>` raiz do layout `_candidato.tsx`. Isso **não altera** o home nem o admin.

```css
.theme-ocean {
  --background: oklch(0.985 0.005 220);
  --foreground: oklch(0.18 0.04 240);
  --card: oklch(1 0 0);
  --primary: oklch(0.58 0.09 210);       /* #2d8a9e */
  --primary-foreground: oklch(0.98 0 0);
  --accent: oklch(0.78 0.09 190);        /* #5cbdb9 */
  --sidebar: oklch(0.22 0.05 240);       /* #0c2340 */
  --sidebar-foreground: oklch(0.95 0.01 220);
  --sidebar-primary: oklch(0.78 0.09 190);
  --ring: oklch(0.58 0.09 210);
}
```

Fontes carregadas via `<link>` no `head()` do `__root.tsx`; `--font-sans: "Manrope"` e `--font-display: "Sora"` em `@theme`.

## Motion (sutil, sem excesso)

- Fade + slide-up de 8px nos cards de vaga usando `framer-motion` já instalado (stagger 40ms).
- Sidebar transiciona width com `transition-[width]` nativo do shadcn.
- Zero animação em ícones/hover extravagante — "sem cara de IA" significa comedido.

## Componentes novos

- `src/components/candidato/AppSidebarCandidato.tsx`
- `src/components/candidato/PainelHeader.tsx`
- `src/components/VagaCard.tsx` (reutilizável em Home, Vagas do painel e Salvas)
- `src/components/candidato/StatTile.tsx` (métrica clicável)
- `src/components/candidato/ProgressoCV.tsx`

## O que sai / consolida

- `src/routes/candidato.tsx` (arquivo único de 435 linhas) é dividido; vira redirect.
- `/perfil` continua acessível mas o painel embute a mesma UI, evitando "sair" da área.
- Tabs internas antigas são removidas — cada seção tem URL própria (compartilhável, back button funciona).

## Segurança e dados

- Todas as rotas `_candidato.*` protegidas pelo mesmo guard atual (`useAuth` redireciona para `/auth`).
- Nenhuma mudança em RLS, tabelas ou funções server-side; só leitura de `profiles`, `candidaturas`, `favoritos`, `alertas`, `curriculos`, `vagas` como já é hoje.

## Fora de escopo

- Painel do admin e da empresa (não mexemos).
- Novo backend/features (mensagens, chat, entrevistas) — só refino visual e navegação.
