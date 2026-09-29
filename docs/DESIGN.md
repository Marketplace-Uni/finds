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

Extraídos do Figma via MCP na Sprint 0 e aplicados em [`app/globals.css`](../app/globals.css).

- ❌ Nunca usar cor ou tamanho "solto" no código (`#3A7BFF`, `text-[17px]`)
- ✅ Sempre os tokens (`bg-primary`, `text-muted-foreground`, `rounded-lg`)

Se faltar um token, peça ao Caike em vez de improvisar.

### Cores

| Token | Hex | Onde aparece no Figma |
|---|---|---|
| `background` | `#feffd5` | fundo creme de todas as telas |
| `foreground` | `#2b201a` | texto forte, barra de navegação |
| `primary` | `#f3421a` | laranja da marca: logo, CTA, chip ativo |
| `secondary` | `#cfdd4a` | verde-limão: chips de categoria |
| `card` / `muted` / `input` | `#eff0c3` | cards, imagens, barra de busca |
| `accent` / `border` | `#e68c72` | salmão: bordas e acentos suaves |
| `muted-foreground` | `#bfc085` | texto de placeholder |
| `nav` | `#2b201a` | barra de navegação (inferior no mobile, topo no desktop) |
| `destructive` | `#c0281a` | ⚠️ **não existe no Figma** — provisório, confirmar com a Lia |

### Tipografia

Confirmado pela Lia em 28–29/09:

- **Montserrat** — fonte principal, usada na **família completa** (thin a bold, com itálicos)
- **Anonymous Pro** — textos de apoio do mascote (**Zeca**) e detalhes

As duas estão no **Google Fonts**, carregadas via `next/font` em `app/layout.tsx`. Como a Montserrat é fonte variável, todos os pesos vêm juntos; o itálico é carregado explicitamente. Tamanhos observados no mobile: 9, 10, 11, 12, 14, 16 e 25px (sobem no desktop).

> ⚠️ **Não usar o guia de tipografia da Lia.** Ela avisou que o guia está **desatualizado** ("as tipografias no guia tão erradas, pq eu mudei depois"). A **fonte de verdade são os frames das telas**, de onde os tokens deste documento foram extraídos — o guia não está no arquivo `Paginas-finds` e não foi usado.

### Raios

O design é bem arredondado: `12px` (imagem pequena), `21px` (busca e chips), `30px` (card de anúncio), `34px` (banner) e `76px` (botão pílula) → `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl` e `rounded-pill`.

### Ícones

A Lia usou um kit cujos ícones têm os **mesmos nomes do `lucide-react`** (`Search`, `Bell`, `MapPin`, `Heart`, `Home`, `MessageCircle`, `User`), que é o padrão do shadcn/ui. Use o `lucide-react` direto, sem exportar SVG do Figma.

> Ainda não há **sombras** nem escala de **espaçamento** definidas: o design não usa sombra e o espaçamento é posicional (absoluto). No desktop, usar a escala padrão do Tailwind.

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

## Especificação dos componentes-padrão (Sprint 1, Caike)

Medidas tiradas dos frames `Menu App` (`99:993`) e `Produto` (`151:483`). No mobile tudo é posicionado em absoluto; no desktop, recompor com layout de fluxo.

### Feed / home

- Fundo creme; **barra de busca** pílula (`rounded-md`, fundo `muted`) com placeholder *"O que você está procurando hoje?"* e ícone de lupa.
- **Chips de categoria** em pílula, alternando `secondary` (limão), `primary` (laranja), `accent` (salmão), `nav` (marrom) e uma variante só de contorno. Categorias vistas: Móveis, Livros, Utensílios, Materiais, Decoração, Eletrônicos, Esportivo.
- **Banner "Faça um anúncio!"** em `primary`, `rounded-xl`, com o mascote **Zeca** e a legenda *"o Zeca vai te ajudar nessa…"* em Anonymous Pro.
- Seção **"Suas recomendações"** com cards de anúncio.
- No mobile há uma **barra inferior escura** (home, chat, favoritos, perfil) → no desktop vira a **navbar do topo**.

### Card de anúncio (`ListingCard`)

Fundo `muted`, `rounded-lg`, imagem ocupando quase todo o card e **coração de favoritar no canto superior direito**. No detalhe, os cards relacionados são 129×150.

### Detalhe do anúncio

| Elemento | Especificação |
|---|---|
| Galeria | 360×330, `rounded-[15px]`, carrossel com bolinhas + coração sobreposto |
| Título | Montserrat **Bold 25px** |
| Preço | Montserrat **Bold 25px** (mesmo peso do título) |
| Rótulos de seção | Montserrat Medium 14px ("Descrição", "Categorias", "Características") |
| Categorias | Chips com **hashtag** (`#eletrodomésticos`, `#tecnologia`) |
| Características | Chips de estado (`usado`, `detalhes de uso`) |
| Aviso | Card `muted` de 160px, **"Não caia em golpes!"** em `primary` + ícone de alerta |
| Card do anunciante | Avatar redondo com borda `secondary`, nome Bold 14px, **"última vez visto em 14:29"** e botão "Seguir" |
| CTA | Botão `primary` largo, `rounded-lg`: **"CHAT COM O VENDEDOR"** |
| Rodapé | "Do mesmo vendedor:" + "Exibir mais" + 3 cards |

No desktop: galeria à esquerda, e título/preço/chips/card do anunciante/CTA na coluna da direita, fixos no scroll. O aviso "Não caia em golpes!" e "Do mesmo vendedor" ficam abaixo, na largura total.

> **"última vez visto em 14:29"** confirma o `formatLastSeen()` que o Kaike entrega.

### Pontos para decidir com a Lia

1. **Botão "Seguir" o vendedor** — seguir usuários não está no [ESCOPO.md](ESCOPO.md), nem no P0 nem no P1. Sugestão: **não implementar** e tirar do layout.
2. **Fonte Inter** aparece solta em alguns textos ("Do mesmo vendedor", "Exibir mais", "Seguir"), enquanto o resto é Montserrat. A Lia confirmou que usou só Montserrat e Anonymous Pro, então é **resíduo do default do Figma**: tratado como Montserrat no código. Vale ela corrigir no arquivo para não voltar a confundir.
3. **Typo "ordernar"** na barra de filtros de `Resultados de busca` (deveria ser "ordenar"). No código já está correto.

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
