import Link from "next/link";

import { requireUser } from "@/src/lib/auth";
import { fetchRoommateListings } from "@/src/lib/listings";
import { fetchTraitLabels, fetchUserTraits, fetchUserTraitsBulk } from "@/src/lib/traits";
import { matchingTraitKeys, matchScore } from "@/src/lib/match";
import { ListingGrid } from "@/src/components/listings/listing-grid";
import { MatchCard } from "@/src/components/match/match-card";
import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState } from "@/src/components/ui/states";

export default async function RoommatesPage() {
  const user = await requireUser("/roommates");

  let listings;
  try {
    listings = await fetchRoommateListings();
  } catch {
    return (
      <ErrorState description="Não conseguimos carregar os anúncios de roommate/república. Recarregue a página." />
    );
  }

  const myTraits = await fetchUserTraits(user.id);

  if (myTraits.wanted.size === 0) {
    return (
      <EmptyState
        title="Monte seu perfil de convivência para ver sua compatibilidade"
        description='Marque o que você procura em quem vai dividir moradia em "Eu procuro", e a gente calcula o quanto cada anúncio combina com você.'
        action={
          <Button asChild className="rounded-pill px-8">
            <Link href="/configuracoes/convivencia">Montar perfil de convivência</Link>
          </Button>
        }
      />
    );
  }

  const outros = listings.filter((listing) => listing.ownerId !== user.id);

  const [ownerTraitsById, traitLabels] = await Promise.all([
    fetchUserTraitsBulk(outros.map((listing) => listing.ownerId)),
    fetchTraitLabels(),
  ]);

  const comScore = outros
    .map((listing) => {
      const ownerTraits = ownerTraitsById.get(listing.ownerId) ?? {
        self: new Set<string>(),
        wanted: new Set<string>(),
      };
      const score = matchScore(myTraits, ownerTraits);
      const commonTraits = matchingTraitKeys(myTraits, ownerTraits).map(
        (key) => traitLabels.get(key) ?? key,
      );
      return { ...listing, score, commonTraits };
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  if (comScore.length === 0) {
    return (
      <EmptyState
        title="Nenhum anúncio de roommate ou república por aqui ainda"
        description="Volte mais tarde — novos anúncios aparecem aqui conforme o pessoal publica."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roommates</h1>
        <p className="text-sm text-muted-foreground">
          Ordenado pela sua compatibilidade de convivência.
        </p>
      </div>

      <ListingGrid className="lg:grid-cols-3 xl:grid-cols-4">
        {comScore.map((listing) => (
          <MatchCard
            key={listing.id}
            href={`/anuncios/${listing.id}`}
            title={listing.title}
            price={listing.price}
            priceNote="por mês"
            location={listing.location}
            imageUrl={listing.imageUrl}
            score={listing.score}
            commonTraits={listing.commonTraits}
          />
        ))}
      </ListingGrid>
    </div>
  );
}
