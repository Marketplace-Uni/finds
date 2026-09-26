# Dev 1: Fundação, Identidade e Match

**Frente:** base do projeto (Next, tema, layout), autenticação, onboarding, perfil e match de roommates.

**Suas pastas:** `src/app/(auth)/`, `src/app/(main)/layout.tsx`, `src/app/(main)/roommates/`, `src/app/(main)/configuracoes/`, `src/components/{ui,layout,auth,match}/`, `src/lib/supabase/`, `src/lib/match.ts`

**Não mexer:** formulários de anúncio (Dev 2), feed/detalhe (Dev 3), chat/transações (Dev 4), `supabase/migrations/` (peça ao Dev 2).

**O que você entrega para os outros:**
- Componentes `ui/` com a identidade do Finds + layout com navbar
- `requireCompleteProfile()` (servidor) e `useCompleteProfileGate()` (cliente, abre o modal "Complete seu perfil"). Dev 2, 3 e 4 usam
- `formatLastSeen(date)`, que retorna "ativo há 2h". Dev 3 e 4 usam

---

## Sprint 0 · 27–28/09 · Fundação ⚠️ bloqueia o time: fazer primeiro

- [ ] Criar o repositório no GitHub, convidar o time, proteger a `main` (merge só via PR)
- [ ] Criar o projeto Next.js (App Router, TypeScript, Tailwind, ESLint) e **dar push o quanto antes**
- [ ] Instalar e configurar o shadcn/ui
- [ ] Aplicar os **tokens de design** (recebidos do Dev 4 / designer) no tema do Tailwind + fontes da identidade
- [ ] `src/lib/supabase/` (client, server, middleware de sessão) + `.env.example`
- [ ] Layouts `(auth)` (sem navbar) e `(main)` (navbar desktop)
- [ ] **Criar `page.tsx` placeholder para TODAS as rotas** de ARQUITETURA.md, para cada dev só preencher a sua sem conflito
- [ ] Preencher "Comandos" no `CLAUDE.md` e "Rodando o projeto" no `README.md`

## Sprint 1 · 29/09–04/10 · Cadastro e perfil

- [ ] `/cadastro`: nome, username, e-mail, senha; valida o domínio @ufu.br (zod no cliente + checagem no servidor)
- [ ] `/entrar`, logout, `/verificar-email` ("confira sua caixa de entrada")
- [ ] `/completar-perfil?next=...`: escolha do campus, depois redireciona para `next`
- [ ] `requireCompleteProfile()` + `useCompleteProfileGate()` + modal. **Avisar no grupo quando estiver pronto**
- [ ] `/configuracoes`: editar nome, bio, campus, foto (upload no bucket `avatars`)
- [ ] Navbar reage ao login: deslogado (Entrar/Cadastrar), logado (Anunciar, Mensagens, Favoritos, dropdown do avatar)

## Sprint 2 · 05/10–11/10 · Match de roommates ⭐

- [ ] `/configuracoes/convivencia`: selecionar as tags "eu sou" e "procuro" (agrupadas, estilo chips)
- [ ] `src/lib/match.ts`: algoritmo de ARQUITETURA.md. Validar com 3–4 casos conhecidos
- [ ] `/roommates`: anúncios de roommate + república ordenados por score, com o badge **"87% compatível"** e as tags em comum destacadas (reusar o `ListingCard` do Dev 3)
- [ ] Estado vazio: "Monte seu perfil de convivência para ver sua compatibilidade" → link para a configuração
- [ ] Último acesso: atualizar `last_seen_at` no layout `(main)` (no máx. a cada 5 min) + `formatLastSeen()`

## Sprint 3 · 12/10–18/10 · Polimento

- [ ] Onboarding em tela dividida (arte da marca + formulário), conforme o Figma
- [ ] Recuperar senha (P1)
- [ ] Responsivo básico: navbar no celular, layout sem quebrar
- [ ] Correções do QA de design
- [ ] Ensaiar a parte do match no roteiro da demo

## Reta final · 19–20/10
- [ ] Bug bash + só correções
