# Design: do Figma mobile para a web desktop

Todo o design do Finds (nome, logo, identidade, ~80 telas) já existe no Figma, **feito para mobile**. O trabalho aqui é **adaptar**, não redesenhar do zero.

## Usamos o Claude conectado ao Figma (Figma MCP)

O repositório já tem um `.mcp.json` com o servidor MCP oficial da Figma. Com ele, o Claude Code lê direto do arquivo: layout, componentes, variáveis de cor e tipografia, e screenshots dos frames.

### Setup (cada pessoa, uma vez)

1. **Ativar o plano Education do Figma** com o e-mail da UFU (é gratuito). No plano gratuito comum, o MCP tem um limite de chamadas por mês que acaba em uma tarde. O Education libera algo como 200 chamadas por dia.
2. Pedir acesso ao arquivo do Finds para a designer.
3. Abrir o Claude Code na pasta do projeto, rodar `/mcp`, escolher `figma` e fazer login no navegador.
   - Alternativa: instalar o plugin oficial da Figma, com `claude plugin install figma@claude-plugins-official`.

### Como usar no dia a dia

1. No Figma, clique com o botão direito no frame → **Copy link to selection**.
2. No Claude Code:
   > Implemente a página `/anuncios/[id]` baseada neste frame do Figma: `<link>`. É um design mobile: adapte para desktop seguindo os padrões de docs/DESIGN.md e use os componentes de `src/components/ui`.
3. Se a designer já desenhou a versão desktop daquela tela, passe **o link da versão desktop**.

**Economize chamadas:** passe o link de **um frame específico**, nunca da página inteira do Figma.

## Tokens de design

Na Sprint 0, as **cores, fontes, tamanhos, espaçamentos, raios e sombras** são extraídos do Figma (via MCP) para o tema do Tailwind. A partir daí:

- ❌ Nunca usar cor ou tamanho "solto" no código (`#3A7BFF`, `text-[17px]`)
- ✅ Sempre os tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`)

Se faltar um token, peça ao Dev 1 (dono do tema) em vez de improvisar.

## Padrões de adaptação mobile → desktop

| No mobile | No desktop |
|---|---|
| Bottom tab bar | **Navbar no topo**: logo, busca, "Anunciar", mensagens, favoritos, avatar |
| Lista de cards em 1 coluna | **Grid de 3–4 colunas** + **sidebar de filtros** fixa à esquerda |
| Tela de filtros separada | Vira a sidebar (a tela deixa de existir) |
| Lista de conversas → tela da conversa | **Chat em 2 painéis** (lista à esquerda, conversa à direita) |
| Detalhe do anúncio em scroll vertical | **Galeria à esquerda**; título, preço, card do anunciante e botão de contato à direita (fixo no scroll) |
| Formulário em vários passos, uma tela por passo | Wizard centralizado (container de ~720px) com indicador de passos, ou uma página com seções |
| Telas de confirmação, denúncia, avaliação, cancelamento | **Modais** |
| Onboarding em várias telas | **Tela dividida**: arte da marca à esquerda, formulário à direita |
| Menu de perfil / configurações | Dropdown no avatar + página com menu lateral |

Regras gerais:
- Container de conteúdo com largura máxima de ~1280px, centralizado.
- Os alvos de clique podem ser menores que no mobile, mas mantenham o respiro da identidade original.
- **Responsivo básico:** o layout não pode quebrar no celular (grid vira 1 coluna, sidebar vira botão "Filtros"). Não precisa ficar perfeito, mas se alguém abrir no celular na mostra, tem que funcionar.

## Inventário de telas (Sprint 0)

As ~80 telas mobile devem virar **~20–25 páginas + modais** no desktop. Na Sprint 0, a designer e o Dev 4 usam o Claude + MCP para gerar o mapeamento abaixo (tabela a preencher):

| Tela(s) mobile no Figma | Vira no desktop | Rota / componente | Prioridade | Tela-chave redesenhada? |
|---|---|---|---|---|
| _ex.: Home, Home com filtro aberto, Filtros_ | _Feed com sidebar_ | `/` | P0 | Sim |
| … | … | … | … | … |

## Telas-chave desenhadas em desktop pela designer

Ela não redesenha 80 telas. Desenha só as que **definem o padrão**, e o resto o Claude adapta a partir do mobile seguindo esses exemplos:

| Tela | Prazo |
|---|---|
| Navbar + layout base + card de anúncio | 29/09 |
| Home/feed com filtros | 30/09 |
| Detalhe do anúncio | 01/10 |
| Criar anúncio (wizard) | 04/10 |
| Chat (2 painéis) | 05/10 |
| Match de roommates | 06/10 |

## QA de design

Todo PR com mudança visual gera um **preview na Vercel**. A designer revisa esse link e comenta no próprio PR ou no grupo. Ajustes pequenos entram antes do merge; ajustes maiores viram tarefa na sprint seguinte.
