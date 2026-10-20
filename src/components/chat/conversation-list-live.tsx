"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/src/lib/supabase/client";
import { formatMessageTime } from "@/src/lib/chat/format";
import { ConversationList, type Conversation } from "@/src/components/chat/conversation-list";

type RealtimeMessageRow = {
  conversation_id: string;
  content: string;
  created_at: string;
};

/**
 * Mesmo visual do `ConversationList`, só que atualiza a prévia (última
 * mensagem + hora) e reordena pro topo sozinho quando chega uma mensagem
 * nova — sem pedir nada pro servidor de novo (passo 6 do plano, P1 depois do
 * essencial: docs/PLANO-CHAT-REALTIME.md).
 *
 * Uma única assinatura filtrada pelos ids das conversas do usuário
 * (`conversation_id=in.(...)`) em vez de uma por conversa — o mesmo filtro
 * de segurança que a conversa aberta já usa, só estendido pra uma lista.
 */
export function ConversationListLive({
  initialConversations,
  className,
}: {
  initialConversations: Conversation[];
  className?: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);

  // A navegação pra uma conversa diferente troca `active` no servidor —
  // refletir isso quando a prop muda, sem perder atualizações de realtime já
  // aplicadas nesta sessão. "Ajustar estado quando uma prop muda" é feito
  // durante o render, não num efeito (https://react.dev/learn/you-might-not-need-an-effect).
  const activeKey = initialConversations.map((c) => `${c.id}:${c.active}`).join(",");
  const [lastActiveKey, setLastActiveKey] = useState(activeKey);
  if (activeKey !== lastActiveKey) {
    setLastActiveKey(activeKey);
    setConversations(initialConversations);
  }

  const conversationIds = initialConversations.map((conversation) => conversation.id);
  const conversationIdsKey = conversationIds.join(",");

  useEffect(() => {
    if (!conversationIdsKey) return;
    const supabase = createClient();
    let active = true;

    const channel = supabase
      .channel("conversation-list-preview")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=in.(${conversationIdsKey})`,
        },
        (payload) => {
          if (!active) return;
          const row = payload.new as RealtimeMessageRow;

          setConversations((atual) => {
            const index = atual.findIndex((item) => item.id === row.conversation_id);
            if (index === -1) return atual;

            const atualizada: Conversation = {
              ...atual[index],
              lastMessage: row.content,
              time: formatMessageTime(row.created_at),
            };
            const resto = atual.filter((_, i) => i !== index);
            return [atualizada, ...resto];
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [conversationIdsKey]);

  return <ConversationList conversations={conversations} className={className} />;
}
