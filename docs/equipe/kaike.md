# Kaike: Contas, Descoberta e Match

**Frente:** a jornada do usuário do cadastro até achar o que procura: autenticação, onboarding, perfil, feed, busca, detalhe do anúncio e o **match de roommates** ⭐ (o destaque da demo).

**Suas pastas:** o setup do projeto Next (Sprint 0), `src/app/(auth)/` (páginas; o layout é do Caike), `src/app/(main)/page.tsx`, `src/app/(main)/busca/`, `src/app/(main)/anuncios/[id]/` (exceto `editar/`), `src/app/(main)/perfil/[username]/`, `src/app/(main)/configuracoes/`, `src/app/(main)/roommates/`, `src/lib/match.ts`, `src/lib/validations/{auth,profile}.ts`

**Não mexer:** tema, `ui/` e layouts (Caike), migrations e `lib/supabase` (Josué), chat/favoritos/denúncias (Alexandre).

**O que você entrega para os outros:**
- `requireCompleteProfile()` (servidor) e `useCompleteProfileGate()` (cliente, abre o modal "Complete seu perfil"). Josué e Alexandre usam
- `formatLastSeen(date)`, que retorna "ativo há 2h". Alexandre usa no chat
- Slots na página de detalhe e no perfil onde o Alexandre encaixa `<StartChatButton>`, `<FavoriteButton>`, `<ReportButton>` e `<ReviewsList>`

- **O projeto Next criado e no ar na Sprint 0**: todo mundo depende disso

**O que você recebe do Caike:** layout de auth, `ListingCard`, grid, sidebar de filtros, layout do detalhe (Sprint 1); chips de convivência, card de match, cabeçalho do perfil (Sprint 2).

---

## Sprint 0 · 27–28/09 · Projeto no ar ⚠️ bloqueia o time: fazer primeiro

- [x] Criar o projeto Next.js (App Router, TypeScript, Tailwind, ESLint) e **dar push o quanto antes** — já existia, mas estava em `app/` na raiz; movido para `src/app/` (padrão de ARQUITETURA.md)
- [x] `.gitattributes` com `* text=auto eol=lf` (evita diff falso entre Windows e Mac/Linux)
- [x] Instalar e configurar o shadcn/ui (o Caike aplica o tema depois) — já veio pronto no PR do Caike (`components.json`, `src/components/ui/`)
- [x] **Criar `page.tsx` placeholder para TODAS as rotas** de ARQUITETURA.md, para cada dev só preencher a sua sem conflito — exceto `(marketing)/`, que colidiria com `(main)/page.tsx` na rota `/`; falta o Caike definir como as duas convivem antes de criar o placeholder dela
- [x] Preencher "Comandos" no `CLAUDE.md` e "Rodando o projeto" no `README.md`
- [x] Estudar o Supabase Auth com Next (`@supabase/ssr`): cadastro, login, confirmação de e-mail, sessão — `src/lib/supabase/` do Josué chegou via merge de `origin/main`; `src/middleware.ts` (raiz) criado chamando `updateSession()`
- [x] Listar com o Caike os filtros e as informações que aparecem no feed e no detalhe (a partir do Figma) — conversa feita; contrato dos filtros em `docs/DESIGN.md` (sidebar) e das informações do card/detalhe também em `docs/DESIGN.md`, já implementados em `<FiltersSidebar>`, `<ListingCard>` e `<ListingDetail>`
- [x] Rascunhar `src/lib/match.ts` com testes simples (é TypeScript puro, não depende de nada)

## Sprint 1 · 29/09–04/10 · Cadastro, feed e detalhe

- [x] `/cadastro`: nome, username, e-mail, senha; valida o domínio @ufu.br (zod no cliente + checagem no servidor) — `signUp` real via Server Action (`src/app/(auth)/cadastro/actions.ts`), manda `username`/`full_name` pro trigger `handle_new_user()`
- [x] `/entrar`, logout, `/verificar-email` ("confira sua caixa de entrada") — `signInWithPassword` via Server Action com `?next=` (guardado contra open redirect); logout em `/sair` (route handler, usado pelo `<UserMenu>` do Caike)
- [x] `/completar-perfil?next=...`: escolha do campus, depois redireciona para `next` — busca campus reais do banco, salva `campus_id` + `university_id`
- [x] `requireCompleteProfile()` + `useCompleteProfileGate()` + modal — **avisar o Josué e o Alexandre: já está pronto** (`src/lib/auth.ts` e `src/components/auth/complete-profile-gate.tsx`); usa `src/components/ui/dialog.tsx`, um modal simples que fiz pq o Caike ainda não desenhou um no Figma — ele refina depois
- [x] Feed: query paginada ("carregar mais") + filtros com **estado na URL** (`?tipo=produto&campus=...`): tipo, campus, faixa de preço — `src/lib/listings.ts`; `categoria`/`condicao` ficam só na UI por ora (vivem em `listings.details`, formato ainda não entregue pelo Josué)
- [x] Busca por texto → `/busca?q=` (título + descrição, `ilike`) — mesma query de `src/lib/listings.ts`
- [ ] `/anuncios/[id]`: buscar o anúncio + fotos + anunciante e exibir os `details` do tipo (usa os schemas do Josué) — ainda não iniciado: falta o schema de `details` por tipo de anúncio (Sprint 1 do Josué, ainda não entregue em nenhuma branch)

## Sprint 2 · 05/10–11/10 · Perfil e Match ⭐

- [x] `/configuracoes`: editar nome, bio, campus, foto (upload no bucket `avatars`) — form nativo (`useActionState`) por causa do input de arquivo; path fixo `{user.id}/avatar.ext` com `upsert`
- [ ] `/perfil/[username]`: dados, "ativo há X", anúncios ativos, slot para avaliações (Alexandre)
- [x] Último acesso: atualizar `last_seen_at` no layout `(main)` (no máx. a cada 5 min) + `formatLastSeen()` — `touchLastSeen()` em `src/lib/auth.ts`, chamado em `(main)/layout.tsx`; `formatLastSeen()` em `src/lib/format.ts`
- [ ] `/configuracoes/convivencia`: salvar as tags "eu sou" e "procuro"
- [ ] `src/lib/match.ts` final: algoritmo de ARQUITETURA.md, validado com 3–4 casos conhecidos
- [ ] `/roommates`: anúncios de roommate + república ordenados pelo score, usando o card de match do Caike
- [ ] Estado vazio: "Monte seu perfil de convivência para ver sua compatibilidade"

## Sprint 3 · 12/10–18/10 · Polimento

- [ ] Recuperar senha (P1)
- [ ] Conferir que o match fica bonito com os dados do seed final (combinar com o Alexandre)
- [ ] Ajustes do QA de design que caírem para você
- [ ] Ensaiar a parte do match no roteiro da demo

## Reta final · 19–20/10
- [ ] Bug bash + só correções
