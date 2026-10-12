import Link from "next/link";

import { getCurrentProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { fetchListingDetail, fetchUserListings } from "@/src/lib/listings";
import { buildListingDisplay } from "@/src/lib/listing-details";
import { formatLastSeen } from "@/src/lib/format";
import { ListingDetail } from "@/src/components/listings/listing-detail";
import { ListingCard } from "@/src/components/listings/listing-card";
import { ListingGrid } from "@/src/components/listings/listing-grid";
import { ListingStatusBadge } from "@/src/components/listings/listing-status-badge";
import { FavoriteButton } from "@/src/components/favorites/favorite-button";
import { ReportButton } from "@/src/components/reports/report-button";
import { Button } from "@/src/components/ui/button";
import { ErrorState } from "@/src/components/ui/states";

const RELATED_LIMIT = 4;

export default async function AnuncioDetalhePage({
  params,
}: PageProps<"/anuncios/[id]">) {
  const { id } = await params;

  let listing: Awaited<ReturnType<typeof fetchListingDetail>>;
  try {
    listing = await fetchListingDetail(id);
  } catch {
    return (
      <ErrorState description="Não foi possível carregar este anúncio. Tente novamente." />
    );
  }

  if (!listing) {
    return (
      <ErrorState
        title="Anúncio não encontrado"
        description="Ele pode ter sido removido ou encerrado pelo anunciante."
      />
    );
  }

  const viewer = await getCurrentProfile();
  const isOwner = viewer?.id === listing.ownerId;

  let isFavorite = false;
  if (viewer && !isOwner) {
    const supabase = await createClient();
    const { data: favorite } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", viewer.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    isFavorite = Boolean(favorite);
  }

  const relatedListings = (await fetchUserListings(listing.ownerId))
    .filter((related) => related.id !== listing.id)
    .slice(0, RELATED_LIMIT);

  const { categories, attributes, specs, priceNote } = buildListingDisplay(
    listing.type,
    listing.details,
  );

  return (
    <div className="flex flex-col gap-6">
      {isOwner && listing.status !== "active" ? (
        <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 text-sm text-foreground">
          <ListingStatusBadge status={listing.status} />
          Só você vê este anúncio enquanto ele não estiver ativo.
        </div>
      ) : null}

      <ListingDetail
        title={listing.title}
        price={listing.price}
        priceNote={priceNote}
        description={listing.description}
        images={listing.images}
        categories={categories}
        attributes={attributes}
        specs={specs}
        seller={{
          name: listing.seller.name,
          username: listing.seller.username,
          avatarUrl: listing.seller.avatarUrl,
          lastSeen: formatLastSeen(listing.seller.lastSeenAt),
        }}
        favoriteSlot={
          viewer && !isOwner ? (
            <FavoriteButton
              listingId={listing.id}
              isFavorite={isFavorite}
              returnTo={`/anuncios/${listing.id}`}
            />
          ) : undefined
        }
        reportSlot={viewer && !isOwner ? <ReportButton listingId={listing.id} /> : undefined}
        chatSlot={
          isOwner ? (
            <Button asChild className="rounded-pill">
              <Link href={`/anuncios/${listing.id}/editar`}>Editar anúncio</Link>
            </Button>
          ) : (
            // TODO(Alexandre): <StartChatButton listingId={listing.id} /> — a
            // Server Action `startConversation()` já existe em
            // src/lib/chat/actions.ts, falta o componente de botão.
            undefined
          )
        }
        relatedSlot={
          relatedListings.length > 0 ? (
            <ListingGrid>
              {relatedListings.map((related) => (
                <ListingCard
                  key={related.id}
                  href={`/anuncios/${related.id}`}
                  title={related.title}
                  price={related.price}
                  location={related.location}
                  typeLabel={related.typeLabel}
                  imageUrl={related.imageUrl}
                />
              ))}
            </ListingGrid>
          ) : undefined
        }
      />
    </div>
  );
}
