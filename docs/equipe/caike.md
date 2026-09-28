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

## Sprint 0 · 27–28/09 · Fundação visual

> O projeto Next.js, o shadcn/ui e as rotas placeholder são do Kaike (Sprint 0 dele).

- [ ] Proteger a `main` no GitHub (merge só via PR)
- [X] Figma: ativar o Education e conectar o MCP
- [ ] Pedir para a designer dar acesso ao arquivo do Figma
- [ ] **Inventário das ~80 telas** → preencher a tabela "mobile → desktop" em DESIGN.md
- [ ] Extrair os **tokens** (cores, tipografia, espaçamentos, raios, sombras) via MCP para o tema do Tailwind + fontes da identidade
- [ ] Layouts `(auth)` (sem navbar) e `(main)` (navbar desktop)
- [ ] Conversa com a designer: tirar dúvidas da identidade, confirmar categorias e tags de convivência, pedir o **logo em SVG**

## Sprint 1 · 29/09–04/10 · Telas do núcleo

Componentes, em ordem de prioridade:
- [ ] Navbar completa (estados logado/deslogado, dropdown do avatar), **até 29/09**
- [ ] `ListingCard` + grid do feed + sidebar de filtros (visual) → Kaike, **até 30/09**
- [ ] Layout de autenticação em tela dividida (arte + formulário) → Kaike, **até 30/09**
- [ ] Layout do detalhe do anúncio (galeria + coluna de infos + card do anunciante) → Kaike, **até 01/10**
- [ ] Wizard de formulário (passos, navegação) + seletor de fotos → Josué, **até 01/10**
- [ ] Layout do chat em 2 painéis (lista de conversas, balões de mensagem, campo de envio) → Alexandre, **até 01/10**
- [ ] 🎨 **Checkpoint com a designer (~01/10):** tema, navbar, feed e card, **antes** de replicar o padrão

## Sprint 2 · 05/10–11/10 · Telas completas

- [ ] Seletor de tags de convivência (chips "eu sou" / "procuro") + card com o badge **"87% compatível"** e as tags em comum → Kaike, **até 07/10**
- [ ] Cabeçalho do perfil (avatar, campus, "ativo há", nota média) → Kaike, **até 07/10**
- [ ] Abas de "Meus anúncios" + estados do card (rascunho, pausado, vendido) → Josué, **até 07/10**
- [ ] Card de status da negociação no chat + modais (cancelar, denunciar, avaliar) + botão de favorito → Alexandre, **até 07/10**
- [ ] Padrão de estados vazios, de carregamento (skeleton) e de erro, reutilizável por todos
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
