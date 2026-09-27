# Design: do Figma mobile para a web desktop

Todo o design do Finds (nome, logo, identidade, ~80 telas) já existe no Figma, **feito para mobile**. O trabalho é **adaptar**, não redesenhar do zero.

**Quem faz:** o **Caike** é o dono do front-end. Ele adapta as telas usando o **Claude conectado ao Figma (Figma MCP)** e é o único canal com a designer, que não programa e não usa o Claude: ela **opina e valida**, e o Caike implementa.

## Claude + Figma MCP

O repositório tem um `.mcp.json` com o servidor MCP oficial da Figma. Com ele, o Claude Code lê direto do arquivo: layout, componentes, variáveis de cor e tipografia, e screenshots dos frames.

Só o Caike **precisa** configurar. Os outros devs podem configurar se quiserem consultar uma tela, mas o caminho normal é usar os componentes que o Caike já adaptou.

### Setup (uma vez)

1. **Ativar o plano Education do Figma** com o e-mail da UFU (é gratuito). No plano gratuito comum, o MCP tem um limite de chamadas por mês que acaba em uma tarde. O Education libera algo como 200 chamadas por dia.
2. Pedir acesso ao arquivo do Finds para a designer.
3. Abrir o Claude Code na pasta do projeto, rodar `/mcp`, escolher `figma` e fazer login no navegador.
   - Alternativa: instalar o plugin oficial da Figma, com `claude plugin install figma@claude-plugins-official`.

### Uso no dia a dia

1. No Figma, clique com o botão direito no frame → **Copy link to selection**.
2. No Claude Code:
   > Crie o componente `ListingCard` baseado neste frame do Figma: `<link>`. É um design mobile: adapte para desktop seguindo os padrões de docs/DESIGN.md, use os tokens do tema e os componentes de `src/components/ui`. Ele recebe os dados por props.
3. **Economize chamadas:** passe o link de **um frame específico**, nunca da página inteira.

## Divisão visual × lógica

| Quem | Faz |
|---|---|
| **Caike** | Tema, `ui/`, layouts, navbar e os **componentes visuais de destaque** de cada tela (recebem dados por props, não acessam o banco) |
| **Dev da feature** | Rota, busca de dados, server actions, validações, estado. **Monta a página** com os componentes do Caike |
| Elementos simples (campos, listas) | O dev da feature monta com `ui/`, e o Caike aprova o visual no PR |

**Ritmo semanal:** o Caike entrega os componentes da sprint **até quarta-feira**. Os outros devs começam pela lógica e integram a interface na segunda metade da semana. Se o componente atrasar, o dev monta provisoriamente com `ui/` e o Caike refina depois.

## Tokens de design

Na Sprint 0, o Caike extrai do Figma (via MCP) as **cores, fontes, tamanhos, espaçamentos, raios e sombras** para o tema do Tailwind. A partir daí:

- ❌ Nunca usar cor ou tamanho "solto" no código (`#3A7BFF`, `text-[17px]`)
- ✅ Sempre os tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`)

Se faltar um token, peça ao Caike em vez de improvisar.

## Padrões de adaptação mobile → desktop

| No mobile | No desktop |
|---|---|
| Bottom tab bar | **Navbar no topo**: logo, busca, "Anunciar", mensagens, favoritos, avatar |
| Lista de cards em 1 coluna | **Grid de 3–4 colunas** + **sidebar de filtros** fixa à esquerda |
| Tela de filtros separada | Vira a sidebar (a tela deixa de existir) |
| Lista de conversas → tela da conversa | **Chat em 2 painéis** (lista à esquerda, conversa à direita) |
| Detalhe do anúncio em scroll vertical | **Galeria à esquerda**; título, preço, card do anunciante e botão de contato à direita (fixo no scroll) |
| Formulário em vários passos, uma tela por passo | Wizard centralizado (container de ~720px) com indicador de passos |
| Telas de confirmação, denúncia, avaliação, cancelamento | **Modais** |
| Onboarding em várias telas | **Tela dividida**: arte da marca à esquerda, formulário à direita |
| Menu de perfil / configurações | Dropdown no avatar + página com menu lateral |

Regras gerais:
- Container de conteúdo com largura máxima de ~1280px, centralizado.
- Os alvos de clique podem ser menores que no mobile, mas mantenham o respiro da identidade original.
- **Responsivo básico:** o layout não pode quebrar no celular (grid vira 1 coluna, sidebar vira botão "Filtros").

## Inventário de telas (Sprint 0, Caike)

As ~80 telas mobile devem virar **~20–25 páginas + modais** no desktop:

| Tela(s) mobile no Figma | Vira no desktop | Rota / componente | Prioridade | Dev da feature |
|---|---|---|---|---|
| _ex.: Home, Home com filtro aberto, Filtros_ | _Feed com sidebar_ | `/` | P0 | Kaike |
| … | … | … | … | … |

## Trabalhando com a designer

Ela não programa e não usa o Claude. O papel dela é ser a **guardiã da identidade**: opinar, validar e apontar o que ficou fora do padrão. Tudo passa pelo Caike.

**Como mostrar:** o link de preview da Vercel (ela abre no navegador, sem instalar nada) ou uma call com a tela compartilhada. Ela responde com prints comentados no grupo ou com comentários no próprio Figma. O Caike transforma o retorno em tarefas.

| Quando | O que validar com ela |
|---|---|
| Sprint 0 (27–28/09) | Tirar dúvidas da identidade; confirmar as categorias e as tags de convivência; pedir para ela nomear os frames de forma clara no Figma (o Claude entende melhor) |
| ~01/10 | Tema, navbar, feed e card, **antes** de replicar o padrão no resto |
| ~08/10 | Chat, match de roommates, formulários de anúncio |
| ~15/10 | **QA geral:** percorrer o app inteiro e listar os ajustes |
| Sprint 3 | Material do estande: banner/cartaz, QR code, 2–3 slides de apoio (ela faz no Figma) |

Se ela quiser desenhar alguma tela desktop no Figma, ótimo: o Caike passa esse frame para o Claude em vez do mobile. Mas isso não é pré-requisito para nada.
