# Kaike: Contas, Descoberta e Match

**Frente:** a jornada do usuário do cadastro até achar o que procura: autenticação, onboarding, perfil, feed, busca, detalhe do anúncio e o **match de roommates** ⭐ (o destaque da demo).

**Suas pastas:** o setup do projeto Next (Sprint 0), `src/app/(auth)/` (layout e páginas), `src/app/(main)/page.tsx`, `src/app/(main)/busca/`, `src/app/(main)/anuncios/[id]/` (exceto `editar/`), `src/app/(main)/perfil/[username]/`, `src/app/(main)/configuracoes/`, `src/app/(main)/roommates/`, `src/lib/match.ts`, `src/lib/validations/{auth,profile}.ts`

**Não mexer:** tema, `ui/`, navbar e layout `(main)` (Caike), migrations e `lib/supabase` (Josué), chat/favoritos/denúncias (Alexandre).

**O que você entrega para os outros:**
- `requireCompleteProfile()` (servidor) e `useCompleteProfileGate()` (cliente, abre o modal "Complete seu perfil"). Josué e Alexandre usam
- `formatLastSeen(date)`, que retorna "ativo há 2h". Alexandre usa no chat
- Slots na página de detalhe e no perfil onde o Alexandre encaixa `<StartChatButton>`, `<FavoriteButton>`, `<ReportButton>` e `<ReviewsList>`

- **O projeto Next criado e no ar na Sprint 0**: todo mundo depende disso

**O que você recebe do Caike:** os links dos frames do Figma das suas telas, `ListingCard`, grid, sidebar de filtros e layout do detalhe (Sprint 1). O resto (auth, perfil, match) você monta a partir do Figma via MCP, seguindo o padrão dele, e o Caike aprova o visual no PR.

---

## Sprint 0 · 27–28/09 · Projeto no ar ⚠️ bloqueia o time: fazer primeiro

- [ ] Criar o projeto Next.js (App Router, TypeScript, Tailwind, ESLint) e **dar push o quanto antes**
- [ ] `.gitattributes` com `* text=auto eol=lf` (evita diff falso entre Windows e Mac/Linux)
- [ ] Instalar e configurar o shadcn/ui (o Caike aplica o tema depois)
- [ ] Layout `(auth)` sem navbar (básico; o visual vem na Sprint 1)
- [ ] **Criar `page.tsx` placeholder para TODAS as rotas** de ARQUITETURA.md, para cada dev só preencher a sua sem conflito
- [ ] Preencher "Comandos" no `CLAUDE.md` e "Rodando o projeto" no `README.md`
- [ ] Figma: ativar o Education e conectar o MCP (ver DESIGN.md)
- [ ] Estudar o Supabase Auth com Next (`@supabase/ssr`): cadastro, login, confirmação de e-mail, sessão
- [ ] Listar com o Caike os filtros e as informações que aparecem no feed e no detalhe (a partir do Figma)
- [ ] Rascunhar `src/lib/match.ts` com testes simples (é TypeScript puro, não depende de nada)

## Sprint 1 · 29/09–04/10 · Cadastro, feed e detalhe

- [ ] Layout de autenticação em tela dividida (arte da marca + formulário), a partir do Figma
- [ ] `/cadastro`: nome, username, e-mail, senha; valida o domínio @ufu.br (zod no cliente + checagem no servidor)
- [ ] `/entrar`, logout, `/verificar-email` ("confira sua caixa de entrada")
- [ ] `/completar-perfil?next=...`: escolha do campus, depois redireciona para `next`
- [ ] `requireCompleteProfile()` + `useCompleteProfileGate()` + modal. **Avisar no grupo quando estiver pronto**
- [ ] Feed: query paginada ("carregar mais") + filtros com **estado na URL** (`?tipo=produto&campus=...`): tipo, campus/cidade, categoria, faixa de preço
- [ ] Busca por texto → `/busca?q=` (título + descrição)
- [ ] `/anuncios/[id]`: buscar o anúncio + fotos + anunciante e exibir os `details` do tipo (usa os schemas do Josué)

## Sprint 2 · 05/10–11/10 · Perfil e Match ⭐

- [ ] `/configuracoes`: editar nome, bio, campus, foto (upload no bucket `avatars`)
- [ ] Cabeçalho do perfil (avatar, campus, "ativo há", nota média), a partir do Figma
- [ ] `/perfil/[username]`: dados, "ativo há X", anúncios ativos, slot para avaliações (Alexandre)
- [ ] Último acesso: atualizar `last_seen_at` no layout `(main)` (no máx. a cada 5 min) + `formatLastSeen()`
- [ ] `/configuracoes/convivencia`: seletor de tags em chips ("eu sou" / "procuro"), salvando no banco
- [ ] `src/lib/match.ts` final: algoritmo de ARQUITETURA.md, validado com 3–4 casos conhecidos
- [ ] `/roommates`: anúncios de roommate + república ordenados pelo score, com o card de match (badge **"87% compatível"** + tags em comum, a partir do Figma; é o destaque da demo, então valide o visual com o Caike cedo)
- [ ] Estado vazio: "Monte seu perfil de convivência para ver sua compatibilidade"

## Sprint 3 · 12/10–18/10 · Polimento

- [ ] Recuperar senha (P1)
- [ ] Conferir que o match fica bonito com os dados do seed final (combinar com o Alexandre)
- [ ] Ajustes do QA de design que caírem para você
- [ ] Ensaiar a parte do match no roteiro da demo

## Reta final · 19–20/10
- [ ] Bug bash + só correções
