import { requireUser } from "@/src/lib/auth";
import { fetchOwnerProfiles, fetchRoommateListings } from "@/src/lib/listings";
import { fetchTraitLabels, fetchUserTraits, fetchUserTraitsBulk } from "@/src/lib/traits";
import { matchingTraitKeys, matchScore } from "@/src/lib/match";
import { MatchDeck, type MatchCandidate } from "@/src/components/match/match-deck";
import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState, InlineNotice } from "@/src/components/ui/states";
import Link from "next/link";

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

  if (outros.length === 0) {
    return (
      <EmptyState
        title="Nenhum anúncio de roommate ou república por aqui ainda"
        description="Volte mais tarde — novos anúncios aparecem aqui conforme o pessoal publica."
      />
    );
  }

  const [ownerTraitsById, traitLabels, ownerProfiles] = await Promise.all([
    fetchUserTraitsBulk(outros.map((listing) => listing.ownerId)),
    fetchTraitLabels(),
    fetchOwnerProfiles(outros.map((listing) => listing.ownerId)),
  ]);

  const candidates: MatchCandidate[] = outros
    .map((listing) => {
      const ownerTraits = ownerTraitsById.get(listing.ownerId) ?? {
        self: new Set<string>(),
        wanted: new Set<string>(),
      };
      const score = matchScore(myTraits, ownerTraits);
      const commonTraits = matchingTraitKeys(myTraits, ownerTraits).map(
        (key) => traitLabels.get(key) ?? key,
      );
      const otherTraits = [...ownerTraits.self]
        .filter((key) => !myTraits.wanted.has(key))
        .map((key) => traitLabels.get(key) ?? key);
      const owner = ownerProfiles.get(listing.ownerId);

      return {
        id: listing.id,
        href: `/anuncios/${listing.id}`,
        title: listing.title,
        personName: owner?.name ?? "Sem nome",
        personBio: owner?.bio ?? null,
        price: listing.price,
        priceNote: "por mês",
        location: listing.location,
        imageUrl: listing.imageUrl,
        score,
        commonTraits,
        otherTraits,
      };
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Roommates</h1>
        <p className="text-sm text-muted-foreground">
          Ordenado pela sua compatibilidade de convivência.
        </p>
      </div>

      {myTraits.self.size === 0 ? (
        <InlineNotice
          title='Você ainda não marcou nada em "Eu sou"'
          description="Seu score de compatibilidade pode estar mais baixo do que seria — complete seu perfil de convivência pra um cálculo mais justo."
          action={
            <Link
              href="/configuracoes/convivencia"
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              Completar perfil
            </Link>
          }
        />
      ) : null}

      <MatchDeck candidates={candidates} />
    </div>
  );
}
