export type MessagePreviewRow = {
  conversation_id: string;
  content: string;
  created_at: string;
};

/**
 * Pega só a mensagem mais recente de cada conversa, a partir de uma lista já
 * ordenada por `created_at` decrescente — sem bater o banco uma vez por
 * conversa (era um N+1: até 50 round-trips só pra montar a prévia da lista
 * de conversas). Função pura pra ficar fácil de testar sem Supabase.
 */
export function pickLastMessagePerConversation(
  messagesOrderedByMostRecent: MessagePreviewRow[],
): Map<string, MessagePreviewRow> {
  const lastByConversation = new Map<string, MessagePreviewRow>();
  for (const message of messagesOrderedByMostRecent) {
    if (!lastByConversation.has(message.conversation_id)) {
      lastByConversation.set(message.conversation_id, message);
    }
  }
  return lastByConversation;
}
