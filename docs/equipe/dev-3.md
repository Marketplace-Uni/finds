# Dev 3: Descoberta e Dados da demo

**Frente:** tudo que é "encontrar coisas": feed, busca, filtros, detalhe do anúncio, favoritos, denúncias, perfil público. E o **seed**, porque um marketplace vazio não impressiona.

**Suas pastas:** `src/app/(main)/page.tsx`, `src/app/(main)/busca/`, `src/app/(main)/anuncios/[id]/` (exceto `editar/`), `src/app/(main)/favoritos/`, `src/app/(main)/perfil/[username]/`, `src/components/listings/` (exceto `form/`), `src/components/discovery/`, `scripts/seed.ts`, `supabase/seed/`

**Não mexer:** migrations (peça ao Dev 2), formulários de anúncio (Dev 2), chat (Dev 4), navbar/layout (Dev 1).

**O que você entrega para os outros:**
- `ListingCard`: o Dev 1 reusa no match
- Seed rodando cedo, para todo mundo desenvolver com dados realistas
- Slots na página de detalhe e no perfil onde o Dev 4 encaixa `<StartChatButton>` e `<ReviewsList>`

---

## Sprint 0 · 27–28/09 · Conteúdo do seed

- [ ] Montar em `supabase/seed/` (JSON) ~50 anúncios realistas: ~20 produtos, ~12 serviços, ~10 roommate, ~8 república, espalhados pelos campi
- [ ] ~12 usuários fictícios com nome, bio, campus, tags de convivência variadas (para o match ter contraste)
- [ ] Fotos: de preferência **reais** (coisas do time, da casa, de repúblicas de amigos) ou de bancos gratuitos (Unsplash/Pexels)
- [ ] `scripts/seed.ts` v1 (usa a `service_role`, **idempotente**: limpa e recria). Rodar assim que o schema do Dev 2 estiver no ar

## Sprint 1 · 29/09–04/10 · Feed e detalhe

- [ ] `ListingCard` (foto, título, preço ou "a combinar", campus, badge do tipo)
- [ ] Home/feed: grid de 3–4 colunas + "carregar mais"
- [ ] Sidebar de filtros: tipo, campus/cidade, categoria, faixa de preço, **com estado na URL** (`?tipo=produto&campus=...`)
- [ ] Busca por texto na navbar → `/busca?q=` (título + descrição)
- [ ] `/anuncios/[id]`: galeria à esquerda; título, preço, `details` do tipo e card do anunciante à direita; slot para o botão de chat (Dev 4)
- [ ] Estados de carregamento, vazio ("nenhum anúncio encontrado") e erro

## Sprint 2 · 05/10–11/10 · Engajamento e confiança

- [ ] **Favoritos:** coração no card e no detalhe (com o gate de perfil do Dev 1) + página `/favoritos`
- [ ] **Denúncias:** modal com motivos + descrição, gravando em `reports`
- [ ] `/perfil/[username]`: avatar, campus, bio, "ativo há X" (`formatLastSeen` do Dev 1), anúncios ativos, slot para avaliações (Dev 4)
- [ ] Seed v2: conversas de exemplo, favoritos, tags de convivência em todos os usuários

## Sprint 3 · 12/10–18/10 · Vitrine

- [ ] Landing page para deslogados (P1), com a designer
- [ ] **Seed final no `finds-demo`:** as contas reais do time com histórico montado para o roteiro da demo (conversas, uma transação concluída, avaliações, perfil de convivência)
- [ ] Revisar todos os estados vazios
- [ ] Correções do QA de design

## Reta final · 19–20/10
- [ ] Rodar o seed final uma última vez + bug bash + só correções
