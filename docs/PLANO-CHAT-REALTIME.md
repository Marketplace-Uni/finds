# Plano: chat em tempo real de verdade

> Investigação feita em 20/10/2026 a pedido do Guilherme ("as mensagens estão demorando para serem enviadas"). Documento de planejamento — nada aqui foi implementado ainda. Área do Alexandre (`chat/favoritos/denúncias` no `ARQUITETURA.md`); fica para ele (ou quem o time decidir) revisar e executar.

## Resumo

O chat já usa Supabase Realtime, que **é WebSocket por baixo** — não falta tecnologia de transporte. O problema é como o app reage a cada mensagem: tanto para quem envia quanto para quem recebe, uma única mensagem nova dispara um **recarregamento completo da página `/mensagens` no servidor** (lista de conversas inteira, a "última mensagem" de cada uma com uma query por conversa, as mensagens da conversa aberta, a negociação, a avaliação), em vez de só acrescentar a mensagem na tela. Esse é o motivo do atraso — não é falta de WebSocket, é um problema de arquitetura de atualização da UI.

## Como funciona hoje

### Enviar uma mensagem

1. `ChatPanel` (`src/components/chat/chat-panel.tsx:152`) é um `<form action={action}>` comum, sem JavaScript de controle — `action` é a Server Action `sendMessageAction`, criada dentro de `src/app/(main)/mensagens/page.tsx:54`.
2. `sendMessageAction` valida, insere a linha em `messages` e termina com `revalidatePath("/mensagens")` (`page.tsx:104`).
3. Como é um `<form>` sem `router.push`/`redirect`, o Next reenvia a página inteira depois da action — ou seja, **o servidor reexecuta tudo que o `MensagensPage` faz** (ver lista abaixo) só para mostrar a mensagem que acabou de ser enviada.

### Receber uma mensagem (tempo real)

1. `ChatRealtime` (`src/components/chat/chat-realtime.tsx`) assina `postgres_changes` (evento `INSERT` em `messages`, filtrado por `conversation_id`) via `supabase.channel(...).on(...)`.
2. Quando a mensagem chega, o payload inteiro da linha nova (`payload.new`) **chega no cliente e é descartado** — o código só usa `payload.new.id` para deduplicar, e dispara `scheduleRefresh()`.
3. `scheduleRefresh` espera 100ms (debounce) e chama `router.refresh()` — que faz o Next buscar de novo o RSC (React Server Component) da rota atual, ou seja, **o mesmo recarregamento completo do servidor** do item anterior.

### O que `MensagensPage` recarrega a cada mensagem (`src/app/(main)/mensagens/page.tsx:288-473`)

| # | Query | Linha | Observação |
|---|---|---|---|
| 1 | `conversations` do usuário (até 50) | 308 | |
| 2 | `listings` dessas conversas | 339 | |
| 3 | `profiles` dos outros participantes | 343 | |
| 4 | `listing_images` dessas conversas | 348 | |
| 5 | **Última mensagem de CADA conversa, uma query por conversa** | 375-387 | `Promise.all` com uma query por item — **N+1**: com 50 conversas, são 50 round-trips só para montar a lista à esquerda |
| 6 | `UPDATE messages SET read_at` (marca como lida) | 436-443 | |
| 7 | Todas as mensagens da conversa aberta | 451-457 | |
| 8 | A negociação (`transactions`) da conversa | 465-473 | |
| 9 | A avaliação (`reviews`), se a negociação estiver concluída | 488-496 | |

Isso roda **de novo, inteiro**, a cada mensagem enviada ou recebida — por quem mandou e por quem está só olhando a conversa. Em uma conversa ativa trocando mensagens rápido, cada uma paga o custo de (até) 9 grupos de query + o round-trip HTTP do RSC, antes de aparecer na tela.

### Pendência que também afeta isso (não é causa da lentidão, mas bloqueia o realtime rodar)

`docs/PENDENCIAS-RESOLUCAO.md` (item 🟡#5) já registra: não dá para confirmar via código se a tabela `messages` está habilitada na publicação de Realtime do Supabase (`Database → Replication`, no painel) — isso não é algo que uma migration resolve sozinha. **Antes de qualquer mudança de código abaixo, confirmar isso no painel dos dois projetos (`finds-dev` e `finds-demo`)**, ou nada dos passos de tempo real funciona de verdade.

## Plano de implementação

Ideia central: continuar com **Supabase Realtime** (ele já é o WebSocket certo para esse tamanho de projeto — ver "Alternativas consideradas" no fim), só parar de jogar fora o payload que ele já entrega e parar de pedir pro servidor refazer a página inteira a cada mensagem.

### Passo 1 — Confirmar a publicação Realtime (operacional, não é código)

Confirmar em **Database → Replication** nos dois projetos Supabase que a tabela `messages` está marcada para `INSERT` (e `UPDATE`, por causa do `read_at`). Sem isso, nenhum dos passos seguintes entrega mensagem em tempo real de verdade — eles só vão funcionar via polling de fallback (o `setInterval` de 5s que já existe em `chat-realtime.tsx:102`).

### Passo 2 — Resolver o N+1 da "última mensagem por conversa"

Trocar as até-50 queries de `src/app/(main)/mensagens/page.tsx:375-387` por uma única consulta. Duas opções, em ordem de preferência:

- **Opção A (sem migration):** uma única query em `messages` com `IN (conversationIds)`, ordenada por `created_at DESC`, e no servidor (TypeScript) pegar só a primeira ocorrência de cada `conversation_id` — troca 50 round-trips por 1.
- **Opção B (com migration, mais rápido no banco a longo prazo):** guardar `last_message_content` (ou só continuar usando o `last_message_at` que já existe) direto na tabela `conversations`, atualizado por um trigger no `INSERT` de `messages`. Mais trabalho agora, compensa se o número de conversas por usuário crescer muito.

Começar pela Opção A — resolve o problema sem mexer no schema.

### Passo 3 — Lista de mensagens vira client component com estado próprio

Hoje `ChatPanel` é renderizado inteiro pelo servidor a cada `page.tsx`. Extrair só a lista de bolhas (`<ul id="chat-mensagens">` + o `.map` de `MessageBubble`) para um novo client component, ex. `src/components/chat/message-list.tsx`:

- Recebe `initialMessages` do servidor (os mesmos dados de hoje, só na primeira renderização).
- Guarda as mensagens em `useState`, inicializado com `initialMessages`.
- `ChatPanel` continua Server Component (cabeçalho, negociação, formulário de envio) — só a lista de bolhas muda de dono.

### Passo 4 — Realtime aplica o payload direto, sem `router.refresh()`

Em `ChatRealtime` (ou dentro do novo `MessageList`, consolidando os dois componentes), ao receber o evento `INSERT`:

- Formatar `payload.new` no mesmo formato de `ChatMessage` (`id`, `content`, `time`, `mine`, `read`) — a formatação de hora (`formatMessageTime`) precisa virar uma função client-safe compartilhada (hoje vive só no `page.tsx`, Server Component).
- Dar `setMessages((atual) => [...atual, novaMensagem])` em vez de `router.refresh()`.
- Isso elimina o recarregamento do servidor inteiro para quem está **recebendo** a mensagem — ela aparece assim que o evento chega pelo WebSocket, sem esperar um RSC novo.

### Passo 5 — Envio otimista (quem manda vê a mensagem na hora)

Trocar o `<form action={sendMessageAction}>` simples por um client component que:

- Ao submeter, adiciona a mensagem no estado local imediatamente (com um id temporário, ex. `crypto.randomUUID()`), mostrando "enviando..." no lugar da hora.
- Chama a Server Action (continua existindo, com a mesma validação/segurança de hoje) via `startTransition`/`useActionState`.
- Quando a Server Action confirmar (ou quando o evento Realtime da própria mensagem chegar — o que vier primeiro), troca a mensagem otimista pela real; em caso de erro, marca a bolha como "não enviada" com opção de tentar de novo, em vez de simplesmente sumir.
- **Remove o `revalidatePath("/mensagens")` do caminho de enviar mensagem** (`page.tsx:104`) — ele deixa de ser necessário porque o Realtime já entrega a mensagem pra todo mundo (inclusive o remetente, que já tem a versão otimista). Mantém `revalidatePath` só onde ainda faz sentido (ex. a lista de conversas reordenar por `last_message_at` — ver passo 6).

### Passo 6 — Lista de conversas (coluna da esquerda) não precisa mais recarregar a cada mensagem

Hoje qualquer mensagem nova em qualquer conversa também re-renderiza a lista inteira de conversas (parte do mesmo `MensagensPage`). Com os passos acima, isso deixa de acontecer sozinho — o que é bom (menos trabalho), mas a lista de conversas vai ficar com a prévia/hora desatualizada até a pessoa navegar de novo. Tratar como P1 depois dos passos 1-5 (que já resolvem a lentidão em si): assinar também `postgres_changes` em `messages` sem o filtro de `conversation_id` (ou em `conversations`, no `UPDATE` de `last_message_at`) numa assinatura à parte, só para atualizar a prévia/ordem da lista à esquerda, sem tocar na conversa aberta.

### Passo 7 (opcional, não bloqueia nada acima) — "digitando..." ✅ implementado em 20/10/2026

Já que o Realtime do Supabase inclui **Presence** (canal de presença, sem precisar de banco), dá para adicionar um indicador de "fulano está digitando..." como melhoria depois que o essencial (passos 1-6) estiver funcionando. Não é a causa da lentidão reportada — citar aqui só porque é um ganho barato com a mesma infraestrutura, caso o time queira.

**Implementação:** `ChatConversation` (`src/components/chat/chat-conversation.tsx`) reaproveita o mesmo canal já aberto pro `postgres_changes` (`messages:${conversationId}`), com a chave de presença configurada como o próprio `user_id` — assim dá pra distinguir "sou eu" de "é a outra pessoa" direto nas chaves do `presenceState()`, sem guardar nada em lugar nenhum. No `onChange` do campo de mensagem, `track({ typing: true })` uma vez por rajada de teclas; um timer de 2s (`TYPING_TIMEOUT_MS`) sem nenhuma tecla nova dispara `track({ typing: false })` — o mesmo acontece ao enviar a mensagem ou perder o foco. `ChatPanel` passa `peer.name` como `peerName` pro aviso "Fulano está digitando...".

**Achado importante:** Presence **não depende da publicação `postgres_changes`** que está bloqueada (ver `docs/PENDENCIAS-RESOLUCAO.md` item 🔴#5 / [issue #43](https://github.com/Marketplace-Uni/finds/issues/43)) — é um mecanismo à parte, só de WebSocket efêmero. Confirmado com um teste isolado (dois clientes Node, só a chave `anon`, sem login) antes de implementar: a sincronização de presença chega normalmente entre os dois, mesmo com o projeto `finds-dev` ainda sem o `postgres_changes` funcionando. **Então "digitando..." já funciona de verdade na demo**, mesmo que o restante do chat em tempo real (passos 2-6) continue esperando a correção de infraestrutura.

**Verificado:** com 2 contas reais (uma criada só pra este teste, `kaike.qa.realtime@ufu.br`, mais a conta de seed `lucas.silva@ufu.br`) — abri uma conversa de verdade e confirmei nos dois sentidos: (a) o aviso "Lucas Santos Silva está digitando..." aparece na tela de quem está vendo quando o outro lado está digitando, e some de novo quando ele para/sai; (b) o campo de mensagem de fato dispara `track({ typing: true })` ao digitar e volta pra `false` sozinho ~2s depois de parar, inspecionando o estado de presença do canal por fora da aplicação.

### Verificação

- Teste manual com 2 contas reais (2 abas/notebooks), como já é prática do time (ver `PENDENCIAS-KAIKE.md`): mandar mensagem de A, cronometrar até aparecer em B. Hoje passa por um `router.refresh()` inteiro; depois do plano, deve aparecer no instante em que o WebSocket entrega o evento.
- Conferir que enviar continua bloqueado para quem não é participante da conversa (RLS de `messages`/`conversations` não muda neste plano).
- Rodar `npm test` (os testes de `src/lib/validations/chat.test.ts` continuam valendo sem mudança, já que o schema de validação não muda).

## Alternativas consideradas (e por que não)

| Alternativa | Por que não, para este projeto |
|---|---|
| WebSocket server dedicado (Node + `ws`/Socket.IO) | Duplica o que o Supabase Realtime já faz (ele também é WebSocket, via replicação lógica do Postgres). Exigiria um processo sempre ligado, fora do modelo serverless da Vercel — infraestrutura extra sem necessidade para o volume da demo (~12 usuários de seed, Mostra de um dia). |
| Serviço de mensageria gerenciado (Pusher, Ably, Pusher Channels) | Resolve o mesmo problema que o Supabase Realtime já resolve — mais uma conta, mais uma chave de API, mais uma dependência paga, sem ganho real de funcionalidade aqui. |
| Fila de mensagens (RabbitMQ, SQS, etc.) | Filas servem para processamento assíncrono em lote/background, não para push instantâneo num chat 1:1. Overkill total para o escopo do Finds. |

**Recomendação: continuar com Supabase Realtime, só usá-lo certo** (aplicar o payload direto em vez de `router.refresh()`, com envio otimista do lado de quem manda). Resolve a lentidão relatada sem adicionar nenhuma dependência nova nem infraestrutura extra.

## Arquivos que o plano toca (quando for implementado)

- `src/app/(main)/mensagens/page.tsx` — remover o N+1 (passo 2), remover o `revalidatePath` do envio (passo 5), extrair `formatMessageTime` para um módulo compartilhado client-safe.
- `src/components/chat/chat-panel.tsx` — passa a montar o novo `MessageList` (client) em vez do `<ul>` estático.
- `src/components/chat/chat-realtime.tsx` — vira (ou alimenta) o `MessageList`, aplicando o payload em vez de dar `router.refresh()`.
- Novo: `src/components/chat/message-list.tsx` (client) e um componente de formulário de envio com otimismo (ex. `src/components/chat/send-message-form.tsx`).
- `src/lib/chat/actions.ts` ou `page.tsx`'s `sendMessageAction` — mesma validação de hoje, só ajusta o que faz depois do insert.
