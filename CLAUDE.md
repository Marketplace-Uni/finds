# Finds: instruções para o Claude Code

Marketplace universitário da UFU (produtos, serviços, roommates, repúblicas) para a Mostra de Software em **21/10/2026**. Web desktop, adaptado de um design mobile do Figma. Time: 4 devs + 1 designer (que não programa), com pouco tempo por dia: **prefira a solução simples que funciona**.

## Antes de começar qualquer tarefa

1. Pergunte quem é a pessoa (Caike, Josué, Kaike ou Alexandre), se ela não disser, e leia o arquivo dela em `docs/equipe/`.
2. Respeite a seção **"Não mexer"** do arquivo dela. Se a tarefa exigir alterar a área de outra pessoa, **pare e avise** em vez de alterar.
3. Consulte conforme a tarefa: `docs/ESCOPO.md` (prioridades), `docs/ARQUITETURA.md` (stack, pastas, banco), `docs/DESIGN.md` (Figma, adaptação para desktop, divisão visual × lógica).

## Stack

Next.js (App Router) + TypeScript, Tailwind + shadcn/ui, react-hook-form + zod, Supabase (Postgres, Auth, Storage, Realtime), deploy na Vercel.

## Comandos

_A preencher na Sprint 0 (dev, lint, build, gerar tipos do Supabase, rodar o seed)._

## Convenções

- **Idioma:** UI, rotas e mensagens para o usuário em **português (pt-BR)**; código, tabelas e colunas em **inglês**.
- **Server Components por padrão.** `'use client'` só quando houver interação.
- **Mutações via Server Actions**, validadas com zod **no servidor** (schemas em `src/lib/validations/`).
- **Supabase:** use sempre os clientes de `src/lib/supabase/` (`server.ts` / `client.ts`). Nunca use a `service_role` fora de `scripts/`. Toda tabela nova precisa de RLS.
- **Tipos do banco:** importe de `src/types/database.ts` (gerado, não editar à mão).
- **Banco:** nunca edite uma migration existente. Crie um arquivo novo em `supabase/migrations/`.
- **Estados:** toda tela com dados precisa de carregamento, estado vazio e erro.
- Não adicione dependências novas sem necessidade clara. Se adicionar, diga no resumo final.

## Visual e Figma

- **O Caike é dono do visual.** Ele cria o tema, `src/components/ui`, a navbar e os componentes-padrão (`ListingCard`, grid, detalhe do anúncio, estados vazio/erro, modal), e aprova o visual de todo PR.
- **Cada dev monta as telas da própria feature** a partir do Figma, reutilizando `src/components/ui` e os componentes-padrão. Siga o estilo das telas que o Caike já fez. Não invente estilo novo.
- **Estilo:** só tokens do tema (nada de hex ou tamanhos arbitrários). Reutilize `src/components/ui` antes de criar componente novo.
- **Figma:** quando receber um link de frame, use o Figma MCP (contexto de design + screenshot). Se o frame for mobile, adapte para desktop seguindo a tabela de padrões em `docs/DESIGN.md`. Peça sempre um frame específico, não a página inteira (há limite de chamadas).

## Ao terminar uma tarefa

1. Rode lint e build e corrija os erros.
2. Resuma o que mudou e sugira a mensagem de commit.
3. Lembre a pessoa de marcar o checkbox em `docs/equipe/<pessoa>.md`.

## Base de Dados e Tipagens (Supabase)
Sempre que houver uma alteração na estrutura da base de dados, o Dev 2 irá atualizar as migrations. Para atualizares as tipagens localmente, executa:
`npx supabase gen types typescript --linked > src/types/database.ts`
Não edites o ficheiro `database.ts` manualmente.
