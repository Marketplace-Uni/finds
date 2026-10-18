import Link from "next/link";

import { requireUser } from "@/src/lib/auth";
import { fetchOwnerListings } from "@/src/lib/listings";
import { ListingGrid } from "@/src/components/listings/listing-grid";
import { ListingCard } from "@/src/components/listings/listing-card";
import { ListingTabs } from "@/src/components/listings/listing-tabs";
import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { deleteListing, updateListingStatus } from "@/src/app/actions/listings";

const ABAS = [
  { value: "ativos", label: "Ativos" },
  { value: "rascunhos", label: "Rascunhos" },
  { value: "encerrados", label: "Encerrados" },
] as const;

type Aba = (typeof ABAS)[number]["value"];

function isAba(value: string | undefined): value is Aba {
  return ABAS.some((aba) => aba.value === value);
}

export default async function MeusAnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ aba?: string }>;
}) {
  const user = await requireUser("/meus-anuncios");
  const { aba: abaParam } = await searchParams;
  const aba: Aba = isAba(abaParam) ? abaParam : "ativos";

  let listings;
  try {
    listings = await fetchOwnerListings(user.id);
  } catch {
    return <ErrorState description="Não conseguimos carregar seus anúncios. Recarregue a página." />;
  }

  const ativos = listings.filter((listing) => listing.status === "active" || listing.status === "paused");
  const rascunhos = listings.filter((listing) => listing.status === "draft");
  const encerrados = listings.filter((listing) => listing.status === "closed");

  const porAba: Record<Aba, typeof listings> = { ativos, rascunhos, encerrados };
  const listaAtual = porAba[aba];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Meus anúncios</h1>
        <Button asChild className="rounded-pill px-6">
          <Link href="/anunciar">Novo anúncio</Link>
        </Button>
      </div>

      <ListingTabs
        tabs={ABAS.map((item) => ({
          ...item,
          count: porAba[item.value].length,
        }))}
        current={aba}
      />

      {listaAtual.length === 0 ? (
        <EmptyState
          title="Nada por aqui ainda"
          description={
            aba === "ativos"
              ? "Seus anúncios ativos e pausados aparecem aqui."
              : aba === "rascunhos"
                ? "Anúncios salvos como rascunho aparecem aqui."
                : "Anúncios encerrados aparecem aqui."
          }
        />
      ) : (
        <ListingGrid>
          {listaAtual.map((listing) => (
            <ListingCard
              key={listing.id}
              href={`/anuncios/${listing.id}`}
              title={listing.title}
              price={listing.price}
              location={listing.location}
              typeLabel={listing.typeLabel}
              imageUrl={listing.imageUrl}
              status={listing.status}
              actionsSlot={
                <>
                  <Link
                    href={`/anuncios/${listing.id}/editar`}
                    className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary/60 hover:text-primary-foreground"
                  >
                    Editar
                  </Link>

                  {listing.status === "active" ? (
                    <form action={updateListingStatus.bind(null, listing.id, "paused")}>
                      <button className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary/60 hover:text-primary-foreground">
                        Pausar
                      </button>
                    </form>
                  ) : null}

                  {listing.status === "paused" || listing.status === "draft" ? (
                    <form action={updateListingStatus.bind(null, listing.id, "active")}>
                      <button className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary/60 hover:text-primary-foreground">
                        Ativar
                      </button>
                    </form>
                  ) : null}

                  {listing.status !== "closed" ? (
                    <form action={updateListingStatus.bind(null, listing.id, "closed")}>
                      <button className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-foreground hover:bg-primary/60 hover:text-primary-foreground">
                        Encerrar
                      </button>
                    </form>
                  ) : null}

                  <form action={deleteListing.bind(null, listing.id)}>
                    <button className="rounded-pill bg-muted px-3 py-1 text-xs font-semibold text-destructive hover:bg-destructive hover:text-white">
                      Excluir
                    </button>
                  </form>
                </>
              }
            />
          ))}
        </ListingGrid>
      )}
    </div>
  );
}
