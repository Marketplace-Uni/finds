import Link from "next/link";
import { redirect } from "next/navigation";

import { NegotiationCard, type NegotiationStatus } from "@/src/components/transactions/negotiation-card";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { createClient } from "@/src/lib/supabase/server";

const STATUS_FILTERS: { value: "all" | NegotiationStatus; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendentes" },
  { value: "confirmed", label: "Confirmadas" },
  { value: "completed", label: "Concluídas" },
  { value: "cancelled", label: "Canceladas" },
];

export default async function NegociacoesPage({
  searchParams,
}: PageProps<"/negociacoes">) {
  const params = await searchParams;
  const requestedStatus = Array.isArray(params.status) ? params.status[0] : params.status;
  const statusFilter =
    STATUS_FILTERS.find((filter) => filter.value === requestedStatus)?.value ?? "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/entrar?next=%2Fnegociacoes");

  const { data: transactionRows, error: transactionsError } = await supabase
    .from("transactions")
    .select(
      "id, status, listing_id, conversation_id, buyer_id, seller_id, cancel_reason, buyer_completed_at, seller_completed_at, created_at",
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (transactionsError) {
    return (
      <ErrorState description="Não foi possível carregar suas negociações. Tente novamente." />
    );
  }

  const rows = transactionRows ?? [];
  const listingIds = [...new Set(rows.map((item) => item.listing_id).filter(Boolean))];
  const peerIds = [
    ...new Set(
      rows.flatMap((item) => {
        const peers = [] as string[];
        if (item.buyer_id && item.buyer_id !== user.id) peers.push(item.buyer_id);
        if (item.seller_id && item.seller_id !== user.id) peers.push(item.seller_id);
        return peers;
      }),
    ),
  ];

  const [listingsResult, profilesResult] = await Promise.all([
    listingIds.length
      ? supabase.from("listings").select("id, title, price").in("id", listingIds)
      : Promise.resolve({ data: [], error: null }),
    peerIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", peerIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (listingsResult.error || profilesResult.error) {
    return (
      <ErrorState description="Não foi possível carregar os dados das negociações. Tente novamente." />
    );
  }

  const listingsById = new Map((listingsResult.data ?? []).map((listing) => [listing.id, listing]));
  const profilesById = new Map((profilesResult.data ?? []).map((profile) => [profile.id, profile]));

  const negotiations = rows.map((transaction) => {
    const isBuyer = transaction.buyer_id === user.id;
    const peerId = isBuyer ? transaction.seller_id : transaction.buyer_id;
    const peer = peerId ? profilesById.get(peerId) : null;
    const listing = transaction.listing_id ? listingsById.get(transaction.listing_id) : null;
    const status: NegotiationStatus = transaction.status ?? "pending";
    const userCompletedAt = isBuyer ? transaction.buyer_completed_at : transaction.seller_completed_at;
    const otherCompletedAt = isBuyer ? transaction.seller_completed_at : transaction.buyer_completed_at;
    const waitingOther = status === "confirmed" && !!userCompletedAt && !otherCompletedAt;

    return {
      id: transaction.id,
      status,
      listing,
      peer,
      conversationId: transaction.conversation_id,
      cancelReason: transaction.cancel_reason,
      waitingOther,
      createdAt: transaction.created_at,
    };
  });
  const visibleNegotiations = statusFilter === "all"
    ? negotiations
    : negotiations.filter((negotiation) => negotiation.status === statusFilter);

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Negociações
        </p>
        <h1 className="text-2xl font-bold text-foreground">Acompanhe seus negócios</h1>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar negociações por status">
        {STATUS_FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === "all"
                ? "/negociacoes"
                : `/negociacoes?status=${filter.value}`
            }
            aria-current={statusFilter === filter.value ? "page" : undefined}
            className={`rounded-pill px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === filter.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground hover:bg-accent"
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {!visibleNegotiations.length ? (
        <EmptyState
          title={rows.length ? "Nenhuma negociação neste status" : "Nenhuma negociação ainda"}
          description={
            rows.length
              ? "Escolha outro filtro para ver suas negociações."
              : "Quando você enviar ou aceitar uma proposta, ela aparece aqui para acompanhar o andamento."
          }
          action={
            statusFilter !== "all" ? (
              <Link
                href="/negociacoes"
                className="mt-3 rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Ver todas
              </Link>
            ) : undefined
          }
        />
      ) : (
      <div className="grid gap-4">
        {visibleNegotiations.map((negotiation) => {
          const peerName = negotiation.peer?.full_name || negotiation.peer?.username || "Pessoa do Finds";
          const listingTitle = negotiation.listing?.title || "Anúncio";
          const listingPrice = negotiation.listing?.price ?? null;

          return (
            <article
              key={negotiation.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <NegotiationCard
                status={negotiation.status}
                price={listingPrice}
                cancelReason={negotiation.cancelReason}
                waitingOther={negotiation.waitingOther}
                actionsSlot={
                  <Link
                    href={
                      negotiation.conversationId
                        ? `/mensagens?conversation=${encodeURIComponent(negotiation.conversationId)}`
                        : "/mensagens"
                    }
                    className="rounded-pill bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                  >
                    Ver conversa
                  </Link>
                }
              />

              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{peerName}</p>
                  <p className="truncate text-sm text-muted-foreground">{listingTitle}</p>
                </div>

                <Link
                  href={
                    negotiation.conversationId
                      ? `/mensagens?conversation=${encodeURIComponent(negotiation.conversationId)}`
                      : "/mensagens"
                  }
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Abrir chat
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      )}
    </div>
  );
}
