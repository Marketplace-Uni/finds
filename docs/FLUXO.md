# Fluxo de trabalho

4 pessoas usando Claude Code no mesmo repositório: o maior risco é **conflito de merge e código com 4 estilos diferentes**. Estas regras existem para evitar isso.

## Git

- `main` é protegida: **só entra código via Pull Request**.
- Branch por tarefa: `feat/<area>-<descricao>`, `fix/<area>-<descricao>`
  - ex.: `feat/chat-realtime`, `feat/listings-form-product`, `fix/feed-filtro-preco`
- **PRs pequenos** (1 tarefa = 1 PR). PR gigante = conflito garantido.
- **Antes de começar a sessão:** `git pull origin main` e rebase ou merge na sua branch.
- **1 aprovação** de qualquer pessoa do time para mergear. A revisão pode ser rápida: rodou? faz sentido? não mexeu no que não devia?
- Squash merge.
- A Vercel gera um **link de preview** em cada PR. Coloquem no PR e marquem a designer quando houver mudança visual.

## Trabalhando com o Claude Code

1. Abra o Claude Code na raiz do projeto. Ele lê o `CLAUDE.md` automaticamente.
2. Diga quem você é e o que vai fazer:
   > Sou o Dev 3. Leia docs/equipe/dev-3.md e vamos fazer a próxima tarefa da Sprint 1.
3. Para telas, passe o link do frame do Figma (ver [DESIGN.md](DESIGN.md)).
4. Antes de abrir o PR, peça: *"rode lint e build e corrija o que quebrar"*.
5. **Revise o que o Claude gerou antes de commitar.** Vibe coding não é commitar sem ler.

## Migrations (banco)

- O schema completo é criado pelo Dev 2 na Sprint 0.
- Precisa de uma coluna ou tabela nova? Crie **um arquivo novo** em `supabase/migrations/` (nunca edite uma migration já mergeada), avise no grupo e marque o Dev 2 no PR.
- Depois de aplicar uma migration, regenere os tipos (`src/types/database.ts`) no mesmo PR.

## Definição de pronto

Uma tarefa está pronta quando:
- [ ] funciona no preview da Vercel (não só no seu localhost)
- [ ] lint e build passam
- [ ] segue o visual do Figma (tokens, componentes de `ui/`)
- [ ] tem estado de carregamento, estado vazio e erro, quando fizer sentido
- [ ] PR mergeado e checkbox marcado no seu `docs/equipe/<você>.md`

## Travou?

Travou por mais de **30 min**: avise no grupo. Com 1h por dia, uma trava de 2 dias custa 10% do projeto.
