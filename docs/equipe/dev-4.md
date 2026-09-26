# Dev 4: Conversa e Negociação

**Frente:** chat em tempo real, fluxo de transação com confirmação dupla e avaliações. Também faz o inventário do Figma com a designer na Sprint 0.

**Suas pastas:** `src/app/(main)/mensagens/`, `src/app/(main)/negociacoes/`, `src/components/chat/`, `src/components/transactions/`, `src/components/reviews/`, `src/lib/validations/{chat,transactions,reviews}.ts`

**Não mexer:** migrations (peça ao Dev 2), detalhe do anúncio e perfil público (Dev 3; você entrega componentes, ele encaixa), navbar (Dev 1).

**O que você entrega para os outros:**
- `<StartChatButton listingId>`: o Dev 3 coloca no detalhe do anúncio
- `<ReviewsList userId>` + nota média: o Dev 3 coloca no perfil público
- `<UnreadBadge>`: o Dev 1 coloca na navbar

---

## Sprint 0 · 27–28/09 · Figma com o Claude

- [ ] Configurar o Figma MCP (ver DESIGN.md) e ativar o Figma Education
- [ ] Com a designer: **inventário das ~80 telas** → preencher a tabela "mobile → desktop" em DESIGN.md
- [ ] Extrair os **tokens** (cores, tipografia, espaçamentos, raios, sombras) via MCP para `docs/tokens.md` e entregar ao Dev 1
- [ ] Mini-teste do Supabase Realtime (entender `postgres_changes` antes da Sprint 1)

## Sprint 1 · 29/09–04/10 · Chat

- [ ] Server action `startConversation(listingId)`: cria ou reabre (não pode conversar com o próprio anúncio; exige perfil completo)
- [ ] `<StartChatButton>` ("Tenho interesse") → **avisar o Dev 3 quando estiver pronto**
- [ ] `/mensagens`: 2 painéis. À esquerda, as conversas (foto do anúncio, outro usuário, última mensagem, horário); à direita, a conversa com o cabeçalho do anúncio
- [ ] Enviar mensagem + **recebimento em tempo real** (Realtime)
- [ ] Auto-scroll, horário das mensagens, estado vazio ("nenhuma conversa ainda")

## Sprint 2 · 05/10–11/10 · Transações

- [ ] Botão "Propor negociação" no cabeçalho do chat → `pending`
- [ ] Outra parte aceita (`confirmed`) ou recusa (`cancelled` + motivo)
- [ ] "Marcar como concluído" para cada parte; quando as duas marcarem → `completed`
- [ ] Cancelar com motivo obrigatório (modal) em `pending` ou `confirmed`
- [ ] Card de status da negociação dentro do chat
- [ ] Produto concluído → anúncio vira `closed` ("vendido")
- [ ] `/negociacoes`: lista com filtro por status
- [ ] `<UnreadBadge>` com o contador de não lidas (P1)

## Sprint 3 · 12/10–18/10 · Avaliações

- [ ] Modal de avaliação (1–5 estrelas + comentário) liberado após `completed`
- [ ] `<ReviewsList>` + nota média → **avisar o Dev 3**
- [ ] Robustez do chat: reconexão, sem mensagens duplicadas
- [ ] Ensaiar a parte chat + negociação da demo (2 notebooks lado a lado)
- [ ] Correções do QA de design

## Reta final · 19–20/10
- [ ] Bug bash + só correções
