import { createClient } from "@/src/lib/supabase/server";

export async function getUnreadMessageCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .neq("sender_id", userId)
    .is("read_at", null);

  if (error) throw new Error("Não foi possível carregar a contagem de mensagens não lidas.");

  return count ?? 0;
}
