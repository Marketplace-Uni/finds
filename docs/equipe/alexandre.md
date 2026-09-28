# Alexandre: Conversa, Negociação e Dados da demo

**Frente:** tudo que conecta pessoas depois de acharem um anúncio (chat em tempo real, transações com confirmação dupla, avaliações, favoritos, denúncias) e o **seed**, porque um marketplace vazio não impressiona.

**Suas pastas:** `src/app/(main)/mensagens/`, `src/app/(main)/negociacoes/`, `src/app/(main)/favoritos/`, `src/lib/validations/{chat,transactions,reviews,reports}.ts`, `scripts/seed.ts`, `supabase/seed/`

**Não mexer:** tema, `ui/` e layouts (Caike), migrations (peça ao Josué), detalhe do anúncio e perfil (Kaike; você entrega componentes e ele encaixa).

**O que você entrega para os outros:**
- **Seed rodando no início da Sprint 1**, para todo mundo desenvolver com dados realistas
- `<StartChatButton listingId>`, `<FavoriteButton>`, `<ReportButton>`: o Kaike coloca no detalhe do anúncio
- `<ReviewsList userId>` + nota média: o Kaike coloca no perfil
- `<UnreadBadge>`: o Caike coloca na navbar

**O que você recebe do Caike:** os links dos frames do Figma das suas telas e o padrão visual (tema, `ui/`, padrão de modal). Suas telas (chat, negociação, modais) você monta a partir do Figma via MCP, e o Caike aprova o visual no PR.

---

## Sprint 0 · 27–28/09 · Conteúdo do seed

- [ ] Montar em `supabase/seed/` (JSON) ~50 anúncios realistas: ~20 produtos, ~12 serviços, ~10 roommate, ~8 república, espalhados pelos campi
- [ ] ~12 usuários fictícios com nome, bio, campus, tags de convivência variadas (para o match ter contraste)
- [ ] Fotos: de preferência **reais** (coisas do time, da casa, de repúblicas de amigos) ou de bancos gratuitos (Unsplash/Pexels)
- [ ] Figma: ativar o Education e conectar o MCP (ver DESIGN.md)
- [ ] Mini-teste do Supabase Realtime (entender `postgres_changes` antes do chat)

## Sprint 1 · 29/09–04/10 · Seed + Chat

- [ ] `scripts/seed.ts` (usa a `service_role`, **idempotente**: limpa e recria). Rodar no `finds-dev` **até 30/09** e avisar o time
- [ ] Server action `startConversation(listingId)`: cria ou reabre (não pode conversar com o próprio anúncio; exige perfil completo)
- [ ] `<StartChatButton>` ("Tenho interesse") → **avisar o Kaike quando estiver pronto**
- [ ] `/mensagens`: lista de conversas (foto do anúncio, outro usuário, última mensagem, horário) + conversa aberta, no **layout de 2 painéis** (a partir do Figma)
- [ ] Enviar mensagem + **recebimento em tempo real** (Realtime)
- [ ] Auto-scroll, horário das mensagens, estado vazio ("nenhuma conversa ainda")

## Sprint 2 · 05/10–11/10 · Negociação e engajamento

- [ ] Card de status da negociação dentro do chat, a partir do Figma
- [ ] "Propor negociação" no chat → `pending`; a outra parte aceita (`confirmed`) ou recusa (`cancelled` + motivo)
- [ ] "Marcar como concluído" para cada parte; quando as duas marcarem → `completed`
- [ ] Cancelar com motivo obrigatório em `pending` ou `confirmed`
- [ ] Produto concluído → anúncio vira `closed` ("vendido")
- [ ] `/negociacoes`: lista com filtro por status
- [ ] **Favoritos:** `<FavoriteButton>` (com o gate de perfil) + página `/favoritos`
- [ ] **Denúncias:** `<ReportButton>` + modal com motivos, gravando em `reports`
- [ ] `<UnreadBadge>` com o contador de não lidas (P1)

## Sprint 3 · 12/10–18/10 · Avaliações + seed final

- [ ] Modal de avaliação (1–5 estrelas + comentário) liberado após `completed`
- [ ] `<ReviewsList>` + nota média → **avisar o Kaike**
- [ ] **Seed final no `finds-demo`:** as contas reais do time com histórico montado para o roteiro da demo (conversas, uma transação concluída, avaliações, perfil de convivência)
- [ ] Robustez do chat: reconexão, sem mensagens duplicadas
- [ ] Ensaiar a parte chat + negociação da demo (2 notebooks lado a lado)

## Reta final · 19–20/10
- [ ] Rodar o seed final uma última vez + bug bash + só correções
