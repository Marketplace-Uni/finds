/*
export default function MensagensPage() {
  return <p>Em construção — /mensagens</p>;
}
  */


import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ChatPanel } from "@/src/components/chat/chat-panel";
import {
  ConversationList,
  type Conversation,
} from "@/src/components/chat/conversation-list";
import { ErrorState } from "@/src/components/ui/states";
import { createClient } from "@/src/lib/supabase/server";

function formatMessageTime(value: string | null | undefined) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (isSameDay(date, today)) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return "ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

async function sendMessageAction(conversationId: string, formData: FormData) {
  "use server";

  const content = String(formData.get("content") ?? "").trim();
  if (!content || content.length > 2000) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .maybeSingle();

  if (!conversation) return;

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: user.id,
    content,
  });

  if (!error) revalidatePath("/mensagens");
}

export default async function MensagensPage({
  searchParams,
}: PageProps<"/mensagens">) {
  const { conversation: requestedConversationId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?next=%2Fmensagens");
  const selectedConversationId = Array.isArray(requestedConversationId)
    ? requestedConversationId[0]
    : requestedConversationId;

  const { data: conversationRows, error: conversationsError } = await supabase
    .from("conversations")
    .select("id, listing_id, buyer_id, seller_id, created_at, last_message_at")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false })
    .limit(50);

  if (conversationsError) {
    return (
      <ErrorState description="Não foi possível carregar suas conversas. Tente novamente." />
    );
  }

  const validConversations = (conversationRows ?? []).filter(
    (conversation) =>
      conversation.listing_id &&
      conversation.buyer_id &&
      conversation.seller_id,
  );

  const listingIds = [...new Set(validConversations.map((item) => item.listing_id!))];
  const peerIds = [
    ...new Set(
      validConversations.map((item) =>
        item.buyer_id === user.id ? item.seller_id! : item.buyer_id!,
      ),
    ),
  ];

  const [listingsResult, profilesResult, imagesResult] = await Promise.all([
    listingIds.length
      ? supabase.from("listings").select("id, title").in("id", listingIds)
      : Promise.resolve({ data: [], error: null }),
    peerIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", peerIds)
      : Promise.resolve({ data: [], error: null }),
    listingIds.length
      ? supabase
          .from("listing_images")
          .select("listing_id, path, position")
          .in("listing_id", listingIds)
          .order("position", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (listingsResult.error || profilesResult.error || imagesResult.error) {
    return (
      <ErrorState description="Não foi possível carregar suas conversas. Tente novamente." />
    );
  }

  const listingsById = new Map(
    (listingsResult.data ?? []).map((listing) => [listing.id, listing]),
  );
  const profilesById = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile]),
  );
  const listingImagesById = new Map<string, string>();
  for (const image of imagesResult.data ?? []) {
    if (!listingImagesById.has(image.listing_id)) {
      listingImagesById.set(image.listing_id, image.path);
    }
  }

  const conversationsWithLastMessage = await Promise.all(
    validConversations.map(async (conversation) => {
      const { data: lastMessage, error } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", conversation.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      return { conversation, lastMessage, error };
    }),
  );

  if (conversationsWithLastMessage.some((item) => item.error)) {
    return (
      <ErrorState description="Não foi possível carregar suas conversas. Tente novamente." />
    );
  }

  const conversationItems = conversationsWithLastMessage
    .flatMap(({ conversation, lastMessage }) => {
      const listingId = conversation.listing_id;
      const peerId =
        conversation.buyer_id === user.id
          ? conversation.seller_id
          : conversation.buyer_id;
      const listing = listingId ? listingsById.get(listingId) : undefined;
      const peer = peerId ? profilesById.get(peerId) : undefined;

      if (!listing || !peer || !listingId) return [];

      return [{
        id: conversation.id,
        href: `/mensagens?conversation=${encodeURIComponent(conversation.id)}`,
        name: peer?.full_name || peer?.username || "Pessoa do Finds",
        avatarUrl: listingImagesById.get(listingId),
        listingTitle: listing.title,
        lastMessage: lastMessage?.content ?? "Nenhuma mensagem ainda",
        time: formatMessageTime(
          lastMessage?.created_at ??
            conversation.last_message_at ??
            conversation.created_at,
        ),
        active: conversation.id === selectedConversationId,
        conversation,
        listing,
        peer,
        sortTime: lastMessage?.created_at ?? conversation.last_message_at,
      }];
    })
    .sort(
      (left, right) =>
        new Date(right.sortTime ?? 0).getTime() -
        new Date(left.sortTime ?? 0).getTime(),
    );

  const selectedConversation = conversationItems.find(
    (item) => item.id === selectedConversationId,
  );

  const { data: messageRows, error: messagesError } = selectedConversation
    ? await supabase
        .from("messages")
        .select("id, content, sender_id, read_at, created_at")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (messagesError) {
    return (
      <ErrorState description="Não foi possível carregar as mensagens. Tente novamente." />
    );
  }

  const conversations: Conversation[] = conversationItems.map((item) => ({
    id: item.id,
    href: item.href,
    name: item.name,
    avatarUrl: item.avatarUrl,
    listingTitle: item.listingTitle,
    lastMessage: item.lastMessage,
    time: item.time,
    active: item.active,
  }));

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[28rem] gap-4">
      <ConversationList
        conversations={conversations}
        className={`lg:border-r lg:border-border lg:pr-4 ${
          selectedConversation ? "hidden lg:flex" : "flex"
        }`}
      />

      {selectedConversation ? (
        <ChatPanel
          peer={{
            name:
              selectedConversation.peer?.full_name ||
              selectedConversation.peer?.username ||
              "Pessoa do Finds",
            avatarUrl: selectedConversation.peer?.avatar_url,
            profileHref: selectedConversation.peer?.username
              ? `/perfil/${selectedConversation.peer.username}`
              : undefined,
          }}
          messages={(messageRows ?? []).map((message) => ({
            id: message.id,
            content: message.content,
            time: formatMessageTime(message.created_at),
            mine: message.sender_id === user.id,
            read: message.sender_id === user.id && message.read_at !== null,
          }))}
          backHref="/mensagens"
          action={sendMessageAction.bind(null, selectedConversation.id)}
          headerSlot={
            <p className="truncate rounded-md bg-card px-3 py-2 text-xs text-muted-foreground">
              Anúncio: {selectedConversation.listing?.title}
            </p>
          }
          className="flex"
        />
      ) : (
        <div className="hidden min-w-0 flex-1 items-center justify-center text-center lg:flex">
          <div>
            <h2 className="font-semibold text-foreground">
              {conversationItems.length ? "Abra uma conversa" : "Sua caixa de entrada está vazia"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {conversationItems.length
                ? "Selecione uma conversa para ver as mensagens."
                : "Quando você conversar sobre um anúncio, ela aparecerá aqui."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
