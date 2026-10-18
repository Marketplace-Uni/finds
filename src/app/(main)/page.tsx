import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { FiltersSidebar } from "@/src/components/discovery/filters-sidebar";
import { ListingCard } from "@/src/components/listings/listing-card";
import { LandingPage } from "@/src/components/marketing/landing-page";
import { createClient } from "@/src/lib/supabase/server";
import {
  buildListingsHref,
  parseListingFilters,
  parsePage,
} from "@/src/lib/listings-filters";
import {
  CATEGORY_OPTIONS,
  fetchCampusOptions,
  fetchListings,
  type ListingSummary,
} from "@/src/lib/listings";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";

export default async function FeedPage({ searchParams }: PageProps<"/">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Visitante (sem sessão) vê a landing, não o feed. O `(marketing)/` route
  // group nunca foi criado (ficou pendente desde a Sprint 0, por colidir com
  // esta rota em `/`) — renderizar aqui mesmo evita esse conflito.
  if (!user) {
    return <LandingPage />;
  }

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
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* No desktop os filtros ficam ocultos por padrão (pedido do time): o
          checkbox abaixo controla isso só a partir de `lg`, sem mexer no
          toggle próprio do `<FiltersSidebar>` para o celular. */}
      <input id="feed-filtros-desktop" type="checkbox" className="peer sr-only" />

      <div className="lg:hidden lg:peer-checked:block lg:peer-checked:w-64 lg:peer-checked:shrink-0">
        <FiltersSidebar
          action="/"
          q={filters.q ?? undefined}
          campuses={campuses}
          categories={CATEGORY_OPTIONS}
          selected={{ ...filters, campus: filters.campus ?? undefined }}
        />
      </div>

      <div className="flex-1">
        <label
          htmlFor="feed-filtros-desktop"
          className="mb-4 hidden w-fit cursor-pointer items-center gap-2 rounded-pill bg-muted px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-primary/60 hover:text-primary-foreground lg:inline-flex"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          Filtros
        </label>

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
