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

O arquivo do Figma tem **uma página** (`Prototipo final`, id `21:47`) com **86 frames** mobile (393×852), que viram **~22 páginas + modais** no desktop. O visual de todas é do Caike; a coluna "Dev" indica quem faz a lógica.

| Tela(s) mobile no Figma | Qtd | Vira no desktop | Rota / componente | Prio | Dev |
|---|---|---|---|---|---|
| Pág. inicial, Pág. carregamento | 2 | Splash não existe na web: vira a **landing** + estado de carregamento | `(marketing)/` | P1 | Caike |
| Login/ Sign in, Sign in, Login, Menu sign in | 4 | **Tela dividida** (arte + formulário) | `/entrar` | P0 | Kaike |
| Recuperar senha | 1 | Mesma tela dividida | `/recuperar-senha` | P1 | Kaike |
| Profile setup 1.0–1.6 | 7 | **Wizard centralizado** (~720px) com indicador de passos | `/cadastro` + `/completar-perfil` | P0 | Kaike |
| Pop up, Pop up 2 | 2 | **Modais** | `components/ui/dialog` | P0 | Caike |
| Sair | 1 | Item do **dropdown do avatar** | `layout/navbar` | P0 | Caike |
| Menu App, Menu chat | 2 | **Navbar no topo** + feed em grid de 3–4 colunas | `/` | P0 | Kaike |
| Busca 1.0, Resultados de busca, Sem resultado, Campus, Filtros, Ordenar por, Busca localização | 7 | **Sidebar de filtros fixa** + grid; "Filtros", "Ordenar" e "Campus" deixam de ser telas | `/busca` | P0 | Kaike |
| Mapa localização | 1 | **Fora do escopo** (não há mapa no P0/P1) | — | ❌ | — |
| Produto | 1 | **Galeria à esquerda** + coluna de infos e card do anunciante à direita | `/anuncios/[id]` | P0 | Kaike |
| Anúncio de roomate | 1 | Mesmo layout de detalhe, com os `details` de moradia | `/anuncios/[id]` | P0 | Kaike |
| Perfil, Perfil de vendedor | 2 | Página de perfil com anúncios ativos e avaliações | `/perfil/[username]` | P0 | Kaike |
| Editar perfil | 1 | Página com **menu lateral** | `/configuracoes` | P0 | Kaike |
| Chat | 1 | **2 painéis** (conversas à esquerda, conversa à direita) | `/mensagens` | P0 | Alexandre |
| Favoritos | 1 | Grid igual ao do feed | `/favoritos` | P1 | Alexandre |
| Denuncia | 1 | **Modal** | `components/ui/dialog` | P1 | Alexandre |
| Anúncio 1.0 | 1 | Escolha do tipo (4 cards) | `/anunciar` | P0 | Josué |
| Anúncio P 1.1–1.6 | 6 | Wizard — ramo **produto** | `/anunciar/produto` | P0 | Josué |
| Anuncio S 1.0–1.4, Anuncio VS 1.0–1.6 | 12 | Wizard — **serviço**, 2 ramos: "procuro" (S) e "ofereço" (VS) | `/anunciar/servico` | P0 | Josué |
| Anuncio RM 1.0–1.6 | 7 | Wizard — **roommate** ("procuro lugar e alguém pra dividir") | `/anunciar/roommate` | P0 | Josué |
| Anuncio R 1.0–1.8, Anuncio RP 1.0–1.8 | 18 | Wizard — **república/vaga** ("já tenho onde morar"). R e RP são duas iterações quase idênticas: **usar só uma** | `/anunciar/republica` | P0 | Josué |
| Rascunhos, Excluir rascunho | 2 | Aba "Rascunhos" + modal de confirmação | `/meus-anuncios` | P1 | Josué |
| Planos 1.0–1.2, Finalização, Retorno | 5 | **Fora do escopo:** "Boost de anúncio" é monetização, não está no ESCOPO.md e o texto ainda é lorem ipsum | — | ❌ | — |

### Telas que o Figma não tem (decidir com a Lia)

O design foi feito antes do escopo atual, então **algumas features do P0 não têm tela desenhada**:

| Falta | Onde entra | Quem depende |
|---|---|---|
| **Match de roommates** ⭐ (lista ordenada por score, badge "87% compatível", tags em comum) | `/roommates` | Kaike — é o **destaque da demo** |
| **Perfil de convivência** (chips "eu sou" / "procuro") | `/configuracoes/convivencia` | Kaike |
| **Negociação** (propor, aceitar, concluir, cancelar) e `/negociacoes` | dentro do chat | Alexandre |
| **Avaliação** (1–5 estrelas) e lista de avaliações no perfil | modal + `/perfil` | Alexandre |
| **Meus anúncios** completo (abas Ativos/Encerrados; só "Rascunhos" existe) | `/meus-anuncios` | Josué |

Para essas, o caminho é **compor a partir do padrão já estabelecido** (card, grid, modal, chips) e validar com a Lia no checkpoint, em vez de esperar tela nova.

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
