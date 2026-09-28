# Caike: Front-end e Design (ponte com a designer)

**Frente:** a **identidade visual** do Finds na web. Você define o padrão (tema, componentes base, layout, as primeiras telas), é **o único canal de comunicação com a designer** e aprova o visual de todos os PRs.

> Você é quem tem **menos tempo livre** no time, então não fica no caminho crítico. O Kaike cria o projeto, e cada dev monta as telas da própria feature a partir do Figma. Seu trabalho é o que só você pode fazer: **definir o padrão, falar com a designer e garantir a consistência**.

**Suas pastas:** `src/components/ui/`, `src/components/layout/`, o tema (`globals.css` / config do Tailwind), `src/app/(main)/layout.tsx`, a landing page, `docs/DESIGN.md`.
Você também é **dono do visual de todas as telas**: pode ajustar JSX e estilo em qualquer página, mas não mexe na lógica (queries, server actions, validações) dos outros.

**Não mexer:** migrations e `src/lib/supabase/` (Josué), lógica de auth/feed/match (Kaike), lógica de chat/transações (Alexandre).

**Como você trabalha com os outros devs:**
- Você cria a **base**: tema, `ui/`, navbar/layout e os **componentes-padrão** (card de anúncio, grid, detalhe), que mostram como uma tela do Finds deve ficar no desktop.
- Cada dev constrói as telas da própria feature **a partir do Figma via MCP**, seguindo esse padrão.
- Você passa para cada um **os links dos frames** das telas dele e **aprova o visual no PR**.

**Com a designer:** ela não programa e não usa o Claude. Você mostra as telas pelo link de preview da Vercel (ou numa call), ela opina, e você decide o que muda. Checkpoints em [DESIGN.md](../DESIGN.md#trabalhando-com-a-designer).

---

## Sprint 0 · 27–28/09 · Identidade visual

- [ ] Proteger a `main` no GitHub (merge só via PR)
- [ ] Figma: ativar o Education, conectar o MCP, pedir para a designer dar acesso ao arquivo **para os 4 devs**
- [ ] **Inventário das ~80 telas** → preencher a tabela "mobile → desktop" em DESIGN.md, com o dono de cada tela
- [ ] Extrair os **tokens** (cores, tipografia, espaçamentos, raios, sombras) via MCP e aplicar no tema do projeto criado pelo Kaike + fontes da identidade
- [ ] Layout `(main)` com a navbar desktop
- [ ] Conversa com a designer: tirar dúvidas da identidade, confirmar categorias e tags de convivência

## Sprint 1 · 29/09–04/10 · O padrão visual

- [ ] Mandar para Josué, Kaike e Alexandre **os links dos frames** das telas de cada um, **até 29/09**
- [ ] Navbar completa (estados logado/deslogado, dropdown do avatar), **até 30/09**
- [ ] `ListingCard` + grid do feed + sidebar de filtros (visual), **até 01/10**
- [ ] Layout do detalhe do anúncio (galeria + coluna de infos + card do anunciante), **até 02/10**
- [ ] 🎨 **Checkpoint com a designer (~02/10):** tema, navbar, feed e card
- [ ] Revisar o visual dos PRs da sprint

## Sprint 2 · 05/10–11/10 · Consistência

- [ ] Padrão de estados vazios, de carregamento (skeleton) e de erro, reutilizável por todos
- [ ] Padrão de modal (usado em denúncia, avaliação, cancelamento, "complete seu perfil")
- [ ] 🎨 **Checkpoint com a designer (~08/10):** chat, match, formulários
- [ ] Revisar o visual dos PRs da sprint e ajustar o que fugir do padrão

## Sprint 3 · 12/10–18/10 · Vitrine e polimento

- [ ] Landing page para deslogados
- [ ] 🎨 **QA geral com a designer (~15/10):** percorrer o app inteiro, listar os ajustes e **distribuir entre o time**
- [ ] Pedir à designer o material do estande (banner, QR code, 2–3 slides) e revisar com ela

## Reta final · 19–20/10
- [ ] Polimento visual final + bug bash
- [ ] Ensaio da demo e gravação do vídeo backup
