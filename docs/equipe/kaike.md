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
- [x] `/anuncios/[id]`: buscar o anúncio + fotos + anunciante e exibir os `details` do tipo (usa os schemas do Josué) — desbloqueado quando `src/lib/validations/listings.ts` chegou na `main`; `fetchListingDetail()` em `src/lib/listings.ts`, mapeamento dos `details` por tipo em `src/lib/listing-details.ts` (com teste), página monta o `<ListingDetail>` do Caike com `favoriteSlot`/`reportSlot` já plugados nos componentes prontos do Alexandre. **Pendente, fora da minha área:**
  - `chatSlot` sem botão: a action `startConversation()` existe em `src/lib/chat/actions.ts`, mas falta o Alexandre criar o `<StartChatButton>` — hoje o slot fica `undefined` com um `// TODO(Alexandre)` no código
  - Não deu pra testar na tela com dado real: o `finds-dev` está sem nenhum anúncio (`npm run seed` é destrutivo, não rodei sem combinar com o time) — testado só o caminho de "não encontrado"
  - Reparei que `meus-anuncios/page.tsx` (Josué) usa `status` em português (`ativo/pausado/...`), inconsistente com o enum real do banco (`active/draft/paused/closed`) — vale avisar ele

## Sprint 2 · 05/10–11/10 · Perfil e Match ⭐

- [x] `/configuracoes`: editar nome, bio, campus, foto (upload no bucket `avatars`) — form nativo (`useActionState`) por causa do input de arquivo; path fixo `{user.id}/avatar.ext` com `upsert`
- [x] `/perfil/[username]`: dados, "ativo há X", anúncios ativos, slot para avaliações (Alexandre) — usa o `<ProfileHeader>` real do Caike
- [x] Último acesso: atualizar `last_seen_at` no layout `(main)` (no máx. a cada 5 min) + `formatLastSeen()` — `touchLastSeen()` em `src/lib/auth.ts`, chamado em `(main)/layout.tsx`; `formatLastSeen()` em `src/lib/format.ts`
- [x] `/configuracoes/convivencia`: salvar as tags "eu sou" e "procuro" — usa o `<ConvivenciaPicker>` real do Caike; Server Action em `src/app/(main)/configuracoes/convivencia/actions.ts`
- [x] `src/lib/match.ts` final: algoritmo de ARQUITETURA.md, validado com 3–4 casos conhecidos — `matchingTraitKeys()` adicionada; 3 casos com dados reais de `scripts/seed.ts` em `match.test.ts`; acesso a dados em `src/lib/traits.ts`
- [x] `/roommates`: anúncios de roommate + república ordenados pelo score, usando o card de match do Caike — `fetchRoommateListings()` em `src/lib/listings.ts`
- [x] Estado vazio: "Monte seu perfil de convivência para ver sua compatibilidade" — em `/roommates`, quando o usuário não tem tags "procuro"

## Sprint 3 · 12/10–18/10 · Polimento

- [x] Recuperar senha (P1) — `/recuperar-senha` (pede o e-mail, chama `supabase.auth.resetPasswordForEmail`) e `/redefinir-senha` (lê a sessão de recuperação que o link do e-mail cria no browser via `onAuthStateChange("PASSWORD_RECOVERY")`, chama `supabase.auth.updateUser({ password })`). Schemas em `src/lib/validations/auth.ts`. **Pendência operacional, não é código:** o `redirectTo` (`{origin}/redefinir-senha`) precisa estar na lista de "Redirect URLs" do projeto Supabase (`finds-dev`/`finds-demo`) — sem isso o Supabase rejeita o link. Avisei o time ([issue #28](https://github.com/Marketplace-Uni/finds/issues/28))
- [x] Login/cadastro: toggle de mostrar/ocultar senha (`<PasswordField>` novo em `src/components/ui/password-field.tsx` — versão simples, o Caike refina depois, mesmo padrão do `ui/dialog.tsx`), link "Esqueceu a senha?" em `/entrar`, e um "Bem-vindo(a) ao Finds!" + logo em `/cadastro` pro celular (onde o `<AuthArt>` do Caike, que já tem isso, fica escondido). Telas de carregamento em `/entrar`, `/cadastro`, `/recuperar-senha` e `/redefinir-senha`
- [x] Conserta o logout: trocado o Route Handler GET de `/sair` (que exigia dar F5 pra aplicar — `<Link>` navegava client-side e o Router Cache mantinha o navbar "logado") por uma Server Action (`src/app/sair/actions.ts`) com `revalidatePath` + `redirect("/entrar")`, igual o padrão já usado em `entrar()`/`cadastrar()`. **Mexi no `<UserMenu>` do Caike** (`src/components/layout/user-menu.tsx`) pra trocar o `<Link>` por um item com estado "Saindo..." (spinner) enquanto desloga — troquei só o gatilho/estado, mantive o visual (ícone, texto, classes) igual; avisar o Caike pra revisar
- [ ] Conferir que o match fica bonito com os dados do seed final (combinar com o Alexandre)
- [ ] Ajustes do QA de design que caírem para você
- [ ] Ensaiar a parte do match no roteiro da demo
- [x] Telas de carregamento (`loading.tsx` com a logo do Finds, `<LoadingState>` novo em `src/components/ui/states.tsx` — versão simples, o Caike refina depois) em `/busca`, `/anuncios/[id]`, `/perfil/[username]`, `/roommates`, `/configuracoes` e `/completar-perfil`. **Não fiz** em `(main)/page.tsx` (feed) porque um `loading.tsx` ali embaixo cascata pras rotas irmãs que não são minhas (`anunciar`, `meus-anuncios`, `mensagens`, `favoritos`, `negociacoes`) — combinar com o time antes de adicionar
- [x] Animação de entrada (fade + slide sutil) em `/perfil/[username]` e `/anuncios/[id]` — `@keyframes` inline em cada página (não mexi em `globals.css`, é tema do Caike), escopo contido só nessas duas por enquanto
- [x] Campo "Curso" no perfil: `src/lib/courses.ts` com os cursos por campus de Uberlândia (pesquisei no catálogo oficial da Prograd/UFU, 4ª edição), seletor dependente do campus em `/configuracoes`, validado na Server Action. **Pendência real, documentada em issue:** falta a coluna `profiles.course` (migration do Josué) — por enquanto o curso é validado mas **não é salvo**, com aviso disso na própria tela

## Reta final · 19–20/10
- [ ] Bug bash + só correções
- [x] Verificar interação entre contas: anúncio, chat — testado com 2 contas reais; o chat tem bloqueio de infraestrutura, ver abaixo
- [x] Melhorar UX: inserir páginas novas sobre cada serviço dentro da página principal (`/como-funciona/<tipo>`, 19-20/10), verificar responsividade no mobile (auditoria por leitura de código em 20/10 — ver `docs/PENDENCIAS-RESOLUCAO.md` item 10; falta conferir em aparelho real os dois offsets fixos anotados lá)
- [x] Verificar pendencias em PENDENCIAS-RESOLUCAO — revisado em 20/10, atualizado com os achados de hoje (bug do scroll da landing, bug de `/entrar` no celular, causa raiz do chat lento)
- [x] Chat em tempo real de verdade (`docs/PLANO-CHAT-REALTIME.md`, Passos 1–7): N+1 da prévia de conversas resolvido, Realtime aplicado direto no estado (sem `router.refresh()`), envio otimista, lista de conversas reordenando sozinha, e indicador de "digitando..." via Presence. O essencial (passos 2–6) depende da publicação `postgres_changes`, que está bloqueada por infraestrutura (ver [issue #43](https://github.com/Marketplace-Uni/finds/issues/43)) — mas o indicador de "digitando..." (passo 7, Presence puro, sem tabela) **já funciona de verdade mesmo com esse bloqueio**, testado ponta a ponta com 2 contas reais
- [x] Revisão de segurança adversarial do diff da sessão + correção dos 3 achados "Importante" (limite de fotos no servidor, ordem insert-antes-de-delete em `updateListing()`, cleanup do GSAP) — nenhum achado "Crítico"
- [x] Lote de ajustes de UI da reta final: seta dos selects de `/anunciar`, preview ao vivo também em "Editar Anúncio", efeito no menu da conta, toast de confirmação no perfil de convivência
- [x] Dependências novas instaladas: `gsap` (scroll da landing) e `sonner` (toasts) — ver `docs/ARQUITETURA.md`
- [x] Abre a [issue #43](https://github.com/Marketplace-Uni/finds/issues/43) detalhando o bloqueio de infraestrutura do Realtime, pra quem tiver acesso ao painel do Supabase resolver
- [x] Fresta branca ao abrir o menu da conta (Radix compensando a barra de rolagem com `margin-right` no body) — corrigido em `globals.css`
- [x] Opções de categoria em `/anunciar` (produto/serviço) e grupos de traits do perfil de convivência com a primeira letra maiúscula
- [x] Landing: "Como funciona" virou 3 seções com efeito de foco ao rolar (GSAP), texto de um lado e o Zeca do outro
- [x] Roommates: corrigido o bug do scroll do `MatchDeck` pulando de pessoa cedo demais (snap obrigatório + altura fixa); adicionado efeito de "scroll expand" (GSAP) e foto clicável pro anúncio
- [x] Plano de revisão do algoritmo de match + expansão das tags de convivência — `docs/PLANO-MATCH-CONVIVENCIA.md` (algoritmo já validado como correto com dado real; achados e sugestão de 8 tags novas documentados, nada implementado ainda)
- [x] Corrige produção: 400 `INVALID_IMAGE_OPTIMIZE_REQUEST` em toda foto de anúncio (`images.remotePatterns` faltando) — [PR #45](https://github.com/Marketplace-Uni/finds/pull/45)
- [x] Estrela da avaliação: corrigido pra acender todas as estrelas à esquerda da clicada (era um `<div className="contents">` quebrando o seletor CSS entre pares input/label)
- [x] Média de avaliação + quantidade no perfil público: `<ReviewsList>` já existia pronta mas nunca foi plugada (`TODO(Alexandre)`) — plugada, e o resumo do cabeçalho do perfil também passou a receber os dados reais
- [x] Encerramento automático do anúncio generalizado pra todos os tipos (antes só "product") + aviso de confirmação no card da negociação — achado um bug de RLS nesse processo (comprador não conseguia encerrar o anúncio do vendedor), documentado na [issue #46](https://github.com/Marketplace-Uni/finds/issues/46) com a migration já escrita
- [x] Confirmação (modal) antes de encerrar ou excluir um anúncio em `/meus-anuncios`; `deleteListing()` agora também limpa as fotos do Storage (antes só apagava a linha do banco)
- [x] `docs/PLANO-CHAT-REALTIME.md` atualizado: os passos 2-6 já estavam implementados em código, mas o documento nunca registrava isso — só o passo 7 tinha o "✅ implementado"