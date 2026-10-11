import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { ListingCard } from "@/src/components/listings/listing-card";
import { ListingGrid } from "@/src/components/listings/listing-grid";
import { FavoriteButton } from "@/src/components/favorites/favorite-button";
import { requireCompleteProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  product: "Produto",
  service: "Serviço",
  roommate: "Roommate",
  republic: "República",
};

type FavoriteListingRow = {
  id: string;
  title: string;
  price: number | null;
  type: string;
  status: "active" | "draft" | "paused" | "closed";
  campuses: { name: string } | { name: string }[] | null;
  listing_images: { path: string; position: number | null }[] | null;
};

export default async function FavoritosPage() {
  const profile = await requireCompleteProfile("/favoritos");
  const supabase = await createClient();

  const { data: favoriteRows, error: favoritesError } = await supabase
    .from("favorites")
    .select("listing_id, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (favoritesError) {
    return (
      <ErrorState description="Não foi possível carregar seus favoritos. Tente novamente." />
    );
  }

  if (!favoriteRows?.length) {
    return (
      <EmptyState
        title="Nenhum favorito ainda"
        description="Salve anúncios que chamarem sua atenção para encontrá-los por aqui."
      />
    );
  }

  const listingIds = favoriteRows.map((favorite) => favorite.listing_id);
  const { data: listingRows, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, price, type, status, campuses(name), listing_images(path, position)")
    .in("id", listingIds)
    .eq("status", "active");

  if (listingsError) {
    return (
      <ErrorState description="Não foi possível carregar os anúncios favoritos. Tente novamente." />
    );
  }

  const listingsById = new Map(
    ((listingRows ?? []) as FavoriteListingRow[]).map((listing) => [listing.id, listing]),
  );
  const availableListings = favoriteRows.flatMap((favorite) => {
    const listing = listingsById.get(favorite.listing_id);
    if (!listing) return [];

    const campus = Array.isArray(listing.campuses)
      ? listing.campuses[0]
      : listing.campuses;
    const cover = [...(listing.listing_images ?? [])].sort(
      (left, right) => (left.position ?? 0) - (right.position ?? 0),
    )[0];

    return [{
      ...listing,
      location: campus?.name ?? null,
      typeLabel: TYPE_LABELS[listing.type] ?? null,
      imageUrl: cover
        ? supabase.storage.from("listing-images").getPublicUrl(cover.path).data.publicUrl
        : null,
    }];
  });

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Seus favoritos</h1>
        <p className="text-sm text-muted-foreground">
          Anúncios que você salvou para ver depois.
        </p>
      </header>

      {availableListings.length ? (
        <ListingGrid>
          {availableListings.map((listing) => (
            <ListingCard
              key={listing.id}
              href={`/anuncios/${listing.id}`}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              typeLabel={listing.typeLabel}
              imageUrl={listing.imageUrl}
              favoriteSlot={
                <FavoriteButton
                  listingId={listing.id}
                  isFavorite
                  returnTo="/favoritos"
                />
              }
            />
          ))}
        </ListingGrid>
      ) : (
        <EmptyState
          title="Nenhum anúncio favorito disponível"
          description="Os anúncios salvos podem ter sido encerrados. Explore o feed para encontrar outros."
          pose={1}
        />
      )}
    </div>
  );
}
