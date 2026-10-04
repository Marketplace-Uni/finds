import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { FiltersSidebar } from "@/src/components/discovery/filters-sidebar";
import { ListingCard } from "@/src/components/listings/listing-card";
import {
  buildListingsHref,
  parseListingFilters,
  parsePage,
} from "@/src/lib/listings-filters";
import {
  fetchCampusOptions,
  fetchListings,
  type ListingSummary,
} from "@/src/lib/listings";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";

export default async function FeedPage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filters = parseListingFilters(params);
  const page = parsePage(params);

  let campuses: FilterOption[] = [];
  let listings: ListingSummary[] = [];
  let hasMore = false;
  let falhou = false;

  try {
    const [campusesResult, listingsResult] = await Promise.all([
      fetchCampusOptions(),
      fetchListings(filters, page),
    ]);
    campuses = campusesResult;
    listings = listingsResult.listings;
    hasMore = listingsResult.hasMore;
  } catch {
    falhou = true;
  }

  if (falhou) {
    return (
      <ErrorState description="Não conseguimos carregar o feed. Recarregue a página." />
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FiltersSidebar
        action="/"
        q={filters.q ?? undefined}
        campuses={campuses}
        selected={{ ...filters, campus: filters.campus ?? undefined }}
      />

      <div className="flex-1">
        {listings.length === 0 ? (
          <EmptyState
            title="Nenhum anúncio encontrado"
            description="Tente ajustar os filtros ou volte mais tarde."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  href={`/anuncios/${listing.id}`}
                  title={listing.title}
                  price={listing.price}
                  location={listing.location}
                  typeLabel={listing.typeLabel}
                  imageUrl={listing.imageUrl}
                />
              ))}
            </div>

            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <Button asChild variant="outline" className="rounded-pill">
                  <Link href={buildListingsHref("/", params, page + 1)}>Carregar mais</Link>
                </Button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
