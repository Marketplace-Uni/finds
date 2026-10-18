import { createClient } from "@/src/lib/supabase/server";

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data: conversations, error: conversationsError } = await supabase
    .from("conversations")
    .select("id")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  if (conversationsError) {
    throw new Error("Não foi possível carregar suas conversas não lidas.");
  }

  const conversationIds = (conversations ?? []).map((conversation) => conversation.id);
  if (!conversationIds.length) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw new Error("Não foi possível carregar a contagem de mensagens não lidas.");

  return count ?? 0;
}
