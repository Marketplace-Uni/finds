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
import { NegotiationCard } from "@/src/components/transactions/negotiation-card";
import { ReviewDialog } from "@/src/components/transactions/review-dialog";
import { ErrorState } from "@/src/components/ui/states";
import { requireCompleteProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { formatMessageTime } from "@/src/lib/chat/format";
import { pickLastMessagePerConversation } from "@/src/lib/chat/last-message";
import { sendMessageSchema } from "@/src/lib/validations/chat";
import { transactionActionSchema } from "@/src/lib/validations/transactions";

export type SendMessageState = {
  error?: string;
  /** A mensagem recém-criada — o client usa isso pra trocar a versão
   * otimista pela real (ou o Realtime já fez isso antes, o que vier primeiro). */
  message?: { id: string; content: string; createdAt: string };
  /** Incrementa a cada chamada, pro client saber que é uma resposta nova
   * (mesmo padrão de `ListingFormState.attempt`). */
  attempt?: number;
};

/**
 * Insere a mensagem e devolve o estado pro client (compatível com
 * `useActionState`) em vez de redirecionar — o `ChatConversation` (client)
 * já mostra a mensagem otimista e usa esse retorno só pra confirmar/trocar
 * pela versão real, então uma navegação cheia aqui só atrapalharia.
 *
 * Sem `revalidatePath`: o Supabase Realtime já entrega a mensagem pra todo
 * mundo que está com a conversa aberta (inclusive quem mandou, via esse
 * retorno) — pedir pro Next refazer a página inteira a cada mensagem era
 * exatamente a causa da demora reportada (ver docs/PLANO-CHAT-REALTIME.md).
 */
async function sendMessageAction(
  conversationId: string,
  prevState: SendMessageState,
  formData: FormData,
): Promise<SendMessageState> {
  "use server";

  const attempt = (prevState.attempt ?? 0) + 1;

  const parsed = sendMessageSchema.safeParse({
    conversationId,
    content: formData.get("content"),
  });
  if (!parsed.success) {
    return { error: "Digite uma mensagem com até 2000 caracteres.", attempt };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  // Sem sessão não dá pra "voltar o estado" — precisa mesmo navegar pro login.
  if (authError || !user) redirect("/entrar?next=%2Fmensagens");

  const { data: conversation, error: conversationError } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", parsed.data.conversationId)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .maybeSingle();

  if (conversationError) {
    return { error: "Não foi possível enviar a mensagem. Tente novamente.", attempt };
  }
  if (!conversation) {
    return { error: "Esta conversa não está disponível para sua conta.", attempt };
  }

  const { data: inserted, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversation.id,
      sender_id: user.id,
      content: parsed.data.content,
    })
    .select("id, created_at")
    .single();

  if (error || !inserted) {
    return { error: "Não foi possível enviar a mensagem. Tente novamente.", attempt };
  }

  return {
    message: { id: inserted.id, content: parsed.data.content, createdAt: inserted.created_at },
    attempt,
  };
}

async function updateTransactionAction(conversationId: string, formData: FormData) {
  "use server";

  const parsed = transactionActionSchema.safeParse({
    status: formData.get("status"),
    cancelReason: formData.get("cancel_reason") ?? "",
  });
  if (!parsed.success) throw new Error("Confira os dados da negociação.");

  const returnTo = `/mensagens?conversation=${encodeURIComponent(conversationId)}`;
  const profile = await requireCompleteProfile(returnTo);
  const targetStatus = parsed.data.status;
  const cancelReason = parsed.data.cancelReason ?? "";
  const supabase = await createClient();

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select(
      "id, buyer_id, seller_id, status, buyer_completed_at, seller_completed_at, cancel_reason, listing_id, created_by",
    )
    .eq("conversation_id", conversationId)
    .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
    .maybeSingle();
  if (transactionError) throw new Error("Não foi possível carregar a negociação.");

  if (!transaction) {
    if (targetStatus !== "propose") {
      throw new Error("Não existe uma negociação para atualizar.");
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, listing_id, buyer_id, seller_id")
      .eq("id", conversationId)
      .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
      .maybeSingle();

    if (conversationError) throw new Error("Não foi possível verificar a conversa.");
    if (!conversation || !conversation.listing_id) {
      throw new Error("A conversa não está vinculada a um anúncio disponível.");
    }
    if (conversation.buyer_id !== profile.id) {
      throw new Error("Somente quem iniciou a conversa pode propor a negociação.");
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("owner_id, status")
      .eq("id", conversation.listing_id)
      .maybeSingle();
    if (listingError) throw new Error("Não foi possível verificar o anúncio da conversa.");
    if (!listing || listing.status !== "active" || listing.owner_id !== conversation.seller_id) {
      throw new Error("Este anúncio não está disponível para uma nova negociação.");
    }

    const { error } = await supabase.from("transactions").insert({
      conversation_id: conversation.id,
      listing_id: conversation.listing_id,
      buyer_id: conversation.buyer_id,
      seller_id: conversation.seller_id,
      status: "pending",
      created_by: profile.id,
    });

    if (error) throw new Error("Não foi possível propor a negociação.");
    revalidatePath("/mensagens");
    revalidatePath("/negociacoes");
    return;
  }

  const isBuyer = transaction.buyer_id === profile.id;
  const isSeller = transaction.seller_id === profile.id;
  if (!isBuyer && !isSeller) throw new Error("Você não participa desta negociação.");

  if (targetStatus === "accept") {
    if (transaction.status !== "pending" || !isSeller) {
      throw new Error("Somente o anunciante pode aceitar uma proposta pendente.");
    }

    const { error } = await supabase
      .from("transactions")
      .update({ status: "confirmed" })
      .eq("id", transaction.id)
      .eq("status", "pending");

    if (error) throw new Error("Não foi possível aceitar a negociação.");
    revalidatePath("/mensagens");
    revalidatePath("/negociacoes");
    return;
  }

  if (targetStatus === "cancel") {
    if (transaction.status !== "pending" && transaction.status !== "confirmed") {
      throw new Error("Só é possível cancelar uma negociação pendente ou confirmada.");
    }

    const { error } = await supabase
      .from("transactions")
      .update({
        status: "cancelled",
        cancelled_by: profile.id,
        cancel_reason: cancelReason,
      })
      .eq("id", transaction.id)
      .in("status", ["pending", "confirmed"]);

    if (error) throw new Error("Não foi possível cancelar a negociação.");
    revalidatePath("/mensagens");
    revalidatePath("/negociacoes");
    return;
  }

  if (targetStatus === "complete") {
    if (transaction.status !== "confirmed") {
      throw new Error("A negociação precisa estar confirmada para marcar como concluída.");
    }
    if ((isBuyer && transaction.buyer_completed_at) || (isSeller && transaction.seller_completed_at)) {
      throw new Error("Você já marcou esta negociação como concluída.");
    }

    const completionTime = new Date().toISOString();
    const completionUpdate = isBuyer
      ? await supabase
          .from("transactions")
          .update({ buyer_completed_at: completionTime })
          .eq("id", transaction.id)
          .eq("status", "confirmed")
      : await supabase
          .from("transactions")
          .update({ seller_completed_at: completionTime })
          .eq("id", transaction.id)
          .eq("status", "confirmed");

    if (completionUpdate.error) {
      throw new Error("Não foi possível registrar sua confirmação de conclusão.");
    }

    const { data: updatedTransaction, error: updatedTransactionError } = await supabase
      .from("transactions")
      .select("buyer_completed_at, seller_completed_at")
      .eq("id", transaction.id)
      .maybeSingle();
    if (updatedTransactionError || !updatedTransaction) {
      throw new Error("Não foi possível confirmar o estado da negociação.");
    }

    const bothCompleted = !!updatedTransaction.buyer_completed_at && !!updatedTransaction.seller_completed_at;
    if (bothCompleted) {
      const { error: completionError } = await supabase
        .from("transactions")
        .update({ status: "completed" })
        .eq("id", transaction.id)
        .eq("status", "confirmed");
      if (completionError) throw new Error("Não foi possível concluir a negociação.");

      if (transaction.listing_id) {
        const { data: listing, error: listingError } = await supabase
          .from("listings")
          .select("type")
          .eq("id", transaction.listing_id)
          .maybeSingle();
        if (listingError) throw new Error("Não foi possível verificar o anúncio.");

        if (listing?.type === "product") {
          const { error: listingUpdateError } = await supabase
            .from("listings")
            .update({ status: "closed" })
            .eq("id", transaction.listing_id);
          if (listingUpdateError) throw new Error("Não foi possível encerrar o anúncio vendido.");
        }
      }
    }

    revalidatePath("/mensagens");
    revalidatePath("/negociacoes");
    return;
  }

  throw new Error("Esta ação não é válida para o estado atual da negociação.");
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

  // Uma única query pra última mensagem de TODAS as conversas, em vez de uma
  // query por conversa (era um N+1: com 50 conversas, 50 round-trips só pra
  // montar essa prévia — ver docs/PLANO-CHAT-REALTIME.md, passo 2).
  const conversationIds = validConversations.map((conversation) => conversation.id);
  const { data: recentMessages, error: recentMessagesError } = conversationIds.length
    ? await supabase
        .from("messages")
        .select("conversation_id, content, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  if (recentMessagesError) {
    return (
      <ErrorState description="Não foi possível carregar suas conversas. Tente novamente." />
    );
  }

  const lastMessageByConversation = pickLastMessagePerConversation(recentMessages ?? []);

  const conversationItems = validConversations
    .flatMap((conversation) => {
      const lastMessage = lastMessageByConversation.get(conversation.id);
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

  const { error: markReadError } = selectedConversation
    ? await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", selectedConversation.id)
        .neq("sender_id", user.id)
        .is("read_at", null)
    : { error: null };

  if (markReadError) {
    return (
      <ErrorState description="Não foi possível atualizar o estado das mensagens. Tente novamente." />
    );
  }

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

  const { data: transactionData, error: transactionError } = selectedConversation
    ? await supabase
        .from("transactions")
        .select(
          "id, status, buyer_id, seller_id, cancel_reason, buyer_completed_at, seller_completed_at, created_by, listing_id, conversation_id",
        )
        .eq("conversation_id", selectedConversation.id)
        .maybeSingle()
    : { data: null, error: null };

  const transaction = transactionData ?? null;
  const hasTransaction = !!transaction;
  const transactionStatus = transaction?.status ?? "pending";
  const isBuyer = transaction?.buyer_id === user.id;
  const isSeller = transaction?.seller_id === user.id;
  const currentUserHasCompleted =
    Boolean(
      (isBuyer && transaction?.buyer_completed_at) ||
        (isSeller && transaction?.seller_completed_at),
    );
  const canPropose = Boolean(
    selectedConversation && !hasTransaction && selectedConversation.conversation.buyer_id === user.id,
  );
  const { data: existingReview, error: reviewError } =
    transaction?.status === "completed"
      ? await supabase
          .from("reviews")
          .select("id")
          .eq("transaction_id", transaction.id)
          .eq("reviewer_id", user.id)
          .maybeSingle()
      : { data: null, error: null };

  if (transactionError) {
    return (
      <ErrorState description="Não foi possível carregar a negociação. Tente novamente." />
    );
  }
  if (reviewError) {
    return (
      <ErrorState description="Não foi possível verificar sua avaliação. Tente novamente." />
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
    <div className="flex flex-col gap-3">
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
          conversationId={selectedConversation.id}
          currentUserId={user.id}
          action={sendMessageAction.bind(null, selectedConversation.id)}
          headerSlot={
            <div className="flex flex-col gap-2">
              <p className="truncate rounded-md bg-card px-3 py-2 text-xs text-muted-foreground">
                Anúncio: {selectedConversation.listing?.title}
              </p>
              {hasTransaction ? (
                <NegotiationCard
                  status={transactionStatus}
                  cancelReason={transaction?.cancel_reason ?? null}
                  waitingOther={
                    transactionStatus === "confirmed" &&
                    currentUserHasCompleted &&
                    (!isBuyer
                      ? !!transaction?.seller_completed_at
                      : !!transaction?.buyer_completed_at)
                  }
                  actionsSlot={
                    <div className="flex flex-wrap items-start gap-2">
                    {transactionStatus === "pending" && hasTransaction && isSeller ? (
                      <form action={updateTransactionAction.bind(null, selectedConversation.id)}>
                        <button
                          type="submit"
                          name="status"
                          value="accept"
                          className="rounded-pill bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                        >
                          Aceitar negociação
                        </button>
                      </form>
                    ) : null}

                    {transactionStatus === "confirmed" && !currentUserHasCompleted ? (
                      <form action={updateTransactionAction.bind(null, selectedConversation.id)}>
                        <button
                          type="submit"
                          name="status"
                          value="complete"
                          className="rounded-pill bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                        >
                          Marcar como concluído
                        </button>
                      </form>
                    ) : null}

                    {(transactionStatus === "pending" || transactionStatus === "confirmed") &&
                    hasTransaction ? (
                      <form
                        action={updateTransactionAction.bind(null, selectedConversation.id)}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <input
                          name="cancel_reason"
                          required
                          maxLength={500}
                          placeholder="Motivo obrigatório"
                          aria-label="Motivo do cancelamento"
                          className="rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                        <button
                          type="submit"
                          name="status"
                          value="cancel"
                          className="rounded-pill border border-destructive/30 bg-background px-3 py-1.5 text-sm font-medium text-destructive"
                        >
                          {transactionStatus === "pending" && isSeller
                            ? "Recusar proposta"
                            : "Cancelar negociação"}
                        </button>
                      </form>
                    ) : null}

                    {transactionStatus === "completed" && transaction && !existingReview ? (
                      <ReviewDialog
                        transactionId={transaction.id}
                        reviewedName={
                          selectedConversation.peer?.full_name ||
                          selectedConversation.peer?.username ||
                          "a outra pessoa"
                        }
                      />
                    ) : null}

                    {transactionStatus === "completed" && existingReview ? (
                      <p className="text-sm text-muted-foreground">
                        Você já avaliou esta negociação.
                      </p>
                    ) : null}
                    </div>
                  }
                />
              ) : canPropose ? (
                <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">
                    Ainda não há uma negociação para este anúncio.
                  </p>
                  <form action={updateTransactionAction.bind(null, selectedConversation.id)}>
                    <button
                      type="submit"
                      name="status"
                      value="propose"
                      className="rounded-pill bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                    >
                      Propor negociação
                    </button>
                  </form>
                </section>
              ) : null}
            </div>
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
    </div>
  );
}
