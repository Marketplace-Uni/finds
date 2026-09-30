# Finds

> Marketplace universitário da UFU: compra e venda, serviços, roommates e repúblicas, só entre estudantes verificados pelo e-mail institucional.

Projeto para a **Mostra de Software da UFU, em 21/10/2026**.
Time: 4 devs + 1 designer. Desenvolvimento de 27/09 a 20/10/2026, usando Claude Code.

> 🟡 **Status: proposta em validação.** Leiam tudo e comentem no grupo antes do kickoff.

## Por onde começar

| Documento | Para que serve |
|---|---|
| [docs/ESCOPO.md](docs/ESCOPO.md) | O que entra no produto (P0 / P1 / backlog) e o roteiro da demo |
| [docs/ARQUITETURA.md](docs/ARQUITETURA.md) | Stack, estrutura de pastas, banco de dados, páginas |
| [docs/DESIGN.md](docs/DESIGN.md) | Figma mobile → web desktop com o Claude + Figma MCP, e como trabalhamos com a designer |
| [docs/CRONOGRAMA.md](docs/CRONOGRAMA.md) | Sprints, datas e marcos |
| [docs/FLUXO.md](docs/FLUXO.md) | Como trabalhamos: git, PRs, check-ins, definição de pronto |
| [docs/equipe/](docs/equipe/) | **Um arquivo por dev com as tarefas de cada sprint** |
| [CLAUDE.md](CLAUDE.md) | Instruções que o Claude Code lê automaticamente em toda sessão |

## Quem faz o quê

| Pessoa | Frente | Arquivo |
|---|---|---|
| Caike | **Front-end e design**: tema, componentes, adaptação do Figma, ponte com a designer | [caike.md](docs/equipe/caike.md) |
| Josué | Banco, infra e anúncios (4 tipos, fotos, rascunhos, deploy) | [josue.md](docs/equipe/josue.md) |
| Kaike | Contas, descoberta e match (auth, onboarding, perfil, feed, busca, detalhe, match de roommates) | [kaike.md](docs/equipe/kaike.md) |
| Alexandre | Conversa, negociação e dados da demo (chat, transações, avaliações, favoritos, denúncias, seed) | [alexandre.md](docs/equipe/alexandre.md) |
| Designer | Guardiã da identidade visual: opina e valida as telas por meio do Caike (não programa) | [DESIGN.md](docs/DESIGN.md#trabalhando-com-a-designer) |

## Rodando o projeto

1. Instale as dependências: `npm install`
2. Crie um `.env.local` na raiz com as variáveis do Supabase (peça os valores no grupo do time):
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
3. Rode o servidor de desenvolvimento: `npm run dev` e abra http://localhost:3000
4. Antes de abrir um PR: `npm run lint`, `npm run build` e `npm test`

Popular o banco local com dados de demonstração (seed): **a definir**, depende de `scripts/seed.ts` (Alexandre, ainda não entregue).
