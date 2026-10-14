# Alexandre: Conversa, Negociação e Dados da demo

**Frente:** tudo que conecta pessoas depois de acharem um anúncio (chat em tempo real, transações com confirmação dupla, avaliações, favoritos, denúncias) e o **seed**, porque um marketplace vazio não impressiona.

**Suas pastas:** `src/app/(main)/mensagens/`, `src/app/(main)/negociacoes/`, `src/app/(main)/favoritos/`, `src/lib/validations/{chat,transactions,reviews,reports}.ts`, `scripts/seed.ts`, `supabase/seed/`

**Não mexer:** tema, `ui/` e layouts (Caike), migrations (peça ao Josué), detalhe do anúncio e perfil (Kaike; você entrega componentes e ele encaixa).

**O que você entrega para os outros:**
- **Seed rodando no início da Sprint 1**, para todo mundo desenvolver com dados realistas
- `<StartChatButton listingId>`, `<FavoriteButton>`, `<ReportButton>`: o Kaike coloca no detalhe do anúncio
- `<ReviewsList userId>` + nota média: o Kaike coloca no perfil
- `<UnreadBadge>`: o Caike coloca na navbar

**O que você recebe do Caike:** layout do chat em 2 painéis (Sprint 1); card de status da negociação, modais e botão de favorito (Sprint 2).

---

## Sprint 0 · 27–28/09 · Conteúdo do seed

- [x] Montar em `supabase/seed/` (JSON) ~50 anúncios realistas: ~20 produtos, ~12 serviços, ~10 roommate, ~8 república, espalhados pelos campi
- [x] ~12 usuários fictícios com nome, bio, campus, tags de convivência variadas (para o match ter contraste)
- [x] Fotos: de preferência **reais** (coisas do time, da casa, de repúblicas de amigos) ou de bancos gratuitos (Unsplash/Pexels)
- [x] Mini-teste do Supabase Realtime (entender `postgres_changes` antes do chat)

## Sprint 1 · 29/09–04/10 · Seed + Chat

- [x] `scripts/seed.ts` (usa a `service_role`, **idempotente**: limpa e recria). Rodar no `finds-dev` **até 30/09** e avisar o time
- [x] Server action `startConversation(listingId)`: cria ou reabre (não pode conversar com o próprio anúncio; exige perfil completo)
- [x] `<StartChatButton>` ("Tenho interesse") criado em `src/components/chat/start-chat-button.tsx`; falta o Kaike encaixar no detalhe do anúncio
- [x] `/mensagens`: lista de conversas (foto do anúncio, outro usuário, última mensagem, horário) + conversa aberta, no layout do Caike
- [ ] Enviar mensagem + **recebimento em tempo real** (Realtime): assinatura implementada em `src/components/chat/chat-realtime.tsx`; habilitar `messages` na publicação Realtime do Supabase com o Josué e validar entre duas contas
- [x] Auto-scroll, horário das mensagens, estado vazio ("nenhuma conversa ainda")

Para executar a seed, configure `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e `SUPABASE_SEED_TARGET` em `.env.local`. O destino pode ser `finds-dev` ou `finds-demo`; a seed só recria contas marcadas para o destino selecionado. `DATABASE_URL` não é usada pelo script. As imagens `supabase/seed/imagens_seed/anuncio-1` até `anuncio-50` devem acompanhar a ordem de `ad.json`; a seed as envia ao bucket `listing-images`. A seed v1 cria usuários fictícios, anúncios e conversas; o histórico de transações e avaliações da demo ainda precisa ser preparado na Sprint 3.

## Sprint 2 · 05/10–11/10 · Negociação e engajamento

- [x] "Propor negociação" no chat → `pending`
- [x] A outra parte aceita (`confirmed`) ou recusa (`cancelled` + motivo)
- [x] "Marcar como concluído" para cada parte; quando as duas marcarem → `completed`
- [x] Cancelar com motivo obrigatório em `pending` ou `confirmed`
- [x] Produto concluído → anúncio vira `closed` ("vendido")
- [x] `/negociacoes`: lista com filtro por status
- [x] **Favoritos:** `<FavoriteButton>` (com o gate de perfil) + página `/favoritos`
- [x] **Denúncias:** `<ReportButton>` + modal com motivos, gravando em `reports`
- [ ] `<UnreadBadge>`: consulta e componente prontos; falta o Caike conectar a contagem à navbar. A consulta considera apenas conversas do usuário.

## Sprint 3 · 12/10–18/10 · Avaliações + seed final

- [ ] Modal de avaliação (1–5 estrelas + comentário) liberado após `completed`
- [ ] `<ReviewsList>` + nota média → **avisar o Kaike**
- [ ] **Seed final no `finds-demo`:** as contas reais do time com histórico montado para o roteiro da demo (conversas, uma transação concluída, avaliações, perfil de convivência)
- [ ] Robustez do chat: reconexão, sem mensagens duplicadas
- [ ] Ensaiar a parte chat + negociação da demo (2 notebooks lado a lado)

## Reta final · 19–20/10
- [ ] Rodar o seed final uma última vez + bug bash + só correções
