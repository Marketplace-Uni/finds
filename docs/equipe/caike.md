# Caike: Front-end e Design (ponte com a designer)

**Frente:** tudo que é visual. Você traduz o Figma mobile para a web desktop usando o Claude + Figma MCP, cuida do tema e dos componentes, e é **o único canal de comunicação com a designer**: mostra o que foi feito, colhe as opiniões dela e transforma em tarefas.

**Suas pastas:** `src/components/ui/`, `src/components/layout/`, o tema (`globals.css` / config do Tailwind), `src/app/(main)/layout.tsx`, `src/app/(auth)/layout.tsx`, a landing page, `docs/DESIGN.md`.
Você também é **dono do visual de todas as telas**: pode ajustar JSX e estilo em qualquer página, mas não mexe na lógica (queries, server actions, validações) dos outros.

**Não mexer:** migrations e `src/lib/supabase/` (Josué), lógica de auth/feed/match (Kaike), lógica de chat/transações (Alexandre). O setup do projeto Next (estrutura, configs) é do Kaike.

**Como você trabalha com os outros devs:**
- Você cria os **componentes visuais de destaque** de cada tela (lista por sprint abaixo): recebem dados por props e não buscam nada no banco.
- O dev da feature cria a rota, busca os dados, faz as ações e **monta a página com os seus componentes**.
- Coisas simples (campos de formulário, listas) o próprio dev monta com os componentes de `ui/`, e você **aprova o visual no PR**.
- Entregue os componentes de cada sprint **até a quarta-feira**. Os devs fazem a lógica no começo da semana e integram a interface no fim.

**Com a designer:** ela não programa e não usa o Claude. Você mostra as telas pelo link de preview da Vercel (ou numa call), ela opina, e você decide e implementa. Checkpoints em [DESIGN.md](../DESIGN.md#trabalhando-com-a-designer).

---

## ❓ Perguntas para a reunião semanal

Levantadas em 02/10, depois de fechar os componentes das Sprints 0 e 1. **Enquanto não houver resposta, o DESIGN.md não muda** — a divisão de trabalho continua valendo como está escrita acima.

### 1. Quem monta as telas? (com o Kaike)

Hoje o texto acima diz que você entrega **componentes** e o dev da feature **monta a página**. Foi por isso que a home em produção mostra "Em construção": o `ListingCard`, o grid e a sidebar existem, mas ninguém os juntou ainda.

> ⚠️ No App Router, **rota não é back-end**: o `page.tsx` busca os dados *e* devolve o JSX. Não dá para dividir por arquivo; dá para dividir por responsabilidade.

**Pergunta:** fechamos que o Caike entrega a **tela inteira** como componente (`<FeedScreen listings={...} />`) e o `page.tsx` do dev só busca os dados e repassa, sem nenhuma `className`?

- [ ] Sim, tela composta é entrega do Caike
- [X] Não, o dev continua montando a página com os componentes soltos
- [ ] Outro: ______

**Resposta (02/10, com o Kaike):** fica como está. As telas listadas no arquivo do Kaike são dele; o Caike entrega os **componentes visuais** e cada dev monta a própria página com eles. Vale o plano inicial — cada um faz o que foi atribuído no começo. **Nada muda no DESIGN.md.**

### 2. A landing e o feed brigam pela rota `/` (com o Kaike)

Ele não criou o `(marketing)/` e anotou no arquivo dele que *"colidiria com `(main)/page.tsx` na rota `/`; falta o Caike definir como as duas convivem"*. Está esperando você.

**Pergunta:** qual das três?

- [ ] `/` decide pelo login: deslogado vê a landing, logado vê o feed
- [ ] Landing em rota própria (`/sobre`), `/` sempre feed
- [ ] Sem landing no P0

**Vale lembrar na hora:** na Mostra, quem abrir a URL provavelmente estará deslogado — a primeira opção é a que mostra a identidade antes do login.

**Resposta:**

### 3. O que a navbar recebe da sessão? (com o Kaike e o Alexandre)

O `(main)/layout.tsx` hoje passa `user={null}` com um `TODO`, e é por isso que produção mostra "Entrar / Criar conta" mesmo logado.

**Pergunta:** quem preenche, e com quais campos? A navbar precisa de `name`, `username`, `avatarUrl`, `campus` e `unreadCount` — o último vem do Alexandre.

**Resposta:**

### 4. O match ⭐ não tem tela no Figma (com o Kaike, depois com a Lia)

Nenhuma das 86 telas cobre o match nem o perfil de convivência — e é o destaque da demo.

**Pergunta:** componho a partir do padrão que já existe (card + chips + badge) e valido com a Lia depois, ou esperamos ela desenhar?

**Risco a citar:** faltam menos de 3 semanas para 21/10; esperar desenho novo é o maior risco do cronograma.

**Resposta:**

### 5. Categorias e tags de convivência (avisar o time)

A tabela `traits` está vazia e a lista continua pendente com a Lia. Trava o Josué (dados de referência) e o Kaike (convivência e match).

**Pergunta:** o time espera a Lia ou adota uma lista provisória para destravar, com ela validando depois?

**Resposta:**

### 6. Ritmo da Sprint 2

O texto acima diz que você entrega os componentes **até quarta**. A Sprint 1 fechou bem antes disso.

**Pergunta:** mantemos a quarta como marco ou passa a ser sob demanda, conforme cada um pedir?

**Resposta:**

---

## Sprint 0 · 27–28/09 · Fundação visual

> O projeto Next.js, o shadcn/ui e as rotas placeholder são do Kaike (Sprint 0 dele).

- ~~Proteger a `main` no GitHub (merge só via PR)~~ — **descartado** (decisão do Caike em 04/10; o time já vinha usando PR na prática)
- [X] Figma: ativar o Education e conectar o MCP
- [X] Acesso ao arquivo do Figma (leitura funcionando)
- [X] **Inventário das 86 telas** → tabela "mobile → desktop" em DESIGN.md
- [X] Extrair os **tokens** (cores, tipografia, raios) via MCP para o tema + fontes da identidade
- [X] **Instalar o Node.js** na máquina (v24.21.0 + npm 11.19.0)
- [X] Layouts `(auth)` (sem navbar) e `(main)` (navbar desktop)
- [X] Conversa com a designer: bege do fundo escolhido (opção B), logo em SVG recebido (29/09) e os pontos visuais decididos nas 10 anotações de 01/10. **Categorias e tags de convivência:** a Lia também não tem a lista fechada; os componentes recebem as opções por props, então isso não bloqueia o visual — a lista definitiva é dado de referência do banco.

## Sprint 1 · 29/09–04/10 · Telas do núcleo

Componentes, em ordem de prioridade:
- [X] Navbar completa (estados logado/deslogado, dropdown do avatar), **até 29/09**
- [X] `ListingCard` + grid do feed + sidebar de filtros (visual) → Kaike, **até 30/09**
- [X] Layout de autenticação em tela dividida (arte + formulário) → Kaike, **até 30/09**
- [X] Layout do detalhe do anúncio (galeria + coluna de infos + card do anunciante) → Kaike, **até 01/10**
- [X] Wizard de formulário (passos, navegação) + seletor de fotos → Josué, **até 01/10**
- [X] Layout do chat em 2 painéis (lista de conversas, balões de mensagem, campo de envio) → Alexandre, **até 01/10**
- [X] 🎨 **Checkpoint com a designer (~01/10):** tema, navbar, feed e card — ela revisou o `/preview-visual` e devolveu 10 anotações; 9 já aplicadas (ver DESIGN.md)

## Sprint 2 · 05/10–11/10 · Telas completas

- [X] **Zeca nos estados vazio e de erro** — SVG recebido em 04/10; as 7 poses recortadas e aplicadas (estado vazio, erro, login, wizard e faixa "Faça um anúncio")
- [X] Definir com a Lia até onde variar as cores da paleta e usar gradientes, sem perder o laranja como cor de ação (ver DESIGN.md) — ela fechou em 07/10: **manter a paleta como está**, laranja segue exclusivo de ação, sem gradientes
- [X] Seletor de tags de convivência (chips "eu sou" / "procuro") + card com o badge **"87% compatível"** e as tags em comum → Kaike, **até 07/10**
- [X] Cabeçalho do perfil (avatar, campus, "ativo há", nota média) → Kaike, **até 07/10**
- [X] Abas de "Meus anúncios" + estados do card (rascunho, pausado, vendido) → Josué, **até 07/10**
- [X] Card de status da negociação no chat + modais (cancelar, denunciar, avaliar) + botão de favorito → Alexandre, **até 07/10**
- [X] Padrão de estados vazios, de carregamento (skeleton) e de erro, reutilizável por todos — entregue junto com o card na Sprint 1
- [ ] 🎨 **Checkpoint com a designer (~08/10):** chat, match, formulários
- [ ] Revisar o visual dos PRs da sprint

## Sprint 3 · 12/10–18/10 · Vitrine e polimento

- [ ] Landing page para deslogados
- [ ] Responsivo básico: navbar no celular, grid em 1 coluna, sidebar vira botão "Filtros"
- [ ] 🎨 **QA geral com a designer (~15/10):** percorrer o app inteiro, listar os ajustes e priorizar
- [ ] Aplicar os ajustes do QA (distribuir entre o time o que for grande)
- [ ] Pedir à designer o material do estande (banner, QR code, 2–3 slides) e revisar com ela

## Reta final · 19–20/10
- [ ] Polimento visual final + bug bash
- [ ] Ensaio da demo e gravação do vídeo backup
