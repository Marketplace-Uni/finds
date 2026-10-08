import Link from "next/link";

import { getCurrentProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { fetchUserListings } from "@/src/lib/listings";
import { formatLastSeen } from "@/src/lib/format";
import { ProfileHeader } from "@/src/components/profile/profile-header";
import { ListingCard } from "@/src/components/listings/listing-card";
import { ListingGrid } from "@/src/components/listings/listing-grid";
import { Button } from "@/src/components/ui/button";
import { EmptyState, ErrorState } from "@/src/components/ui/states";

export default async function PerfilPublicoPage({
  params,
}: PageProps<"/perfil/[username]">) {
  const { username } = await params;

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, avatar_url, last_seen_at, campuses(name)")
    .eq("username", username)
    .single();

  if (!profile) {
    return (
      <ErrorState
        title="Perfil não encontrado"
        description={`Não existe ninguém com o username @${username}.`}
      />
    );
  }

  const [viewer, listings] = await Promise.all([
    getCurrentProfile(),
    fetchUserListings(profile.id),
  ]);

  const campus = Array.isArray(profile.campuses) ? profile.campuses[0] : profile.campuses;
  const ehOProprioPerfil = viewer?.id === profile.id;

  return (
    <div className="flex flex-col gap-8">
      <ProfileHeader
        name={profile.full_name ?? profile.username ?? "Sem nome"}
        username={profile.username ?? ""}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        campus={campus?.name ?? null}
        lastSeen={formatLastSeen(profile.last_seen_at)}
        actionSlot={
          ehOProprioPerfil ? (
            <Button asChild variant="ghost" className="rounded-pill">
              <Link href="/configuracoes">Editar perfil</Link>
            </Button>
          ) : (
            // TODO(Alexandre): <FavoriteButton>/<ReportButton> de quem vê o perfil de outra pessoa.
            undefined
          )
        }
      />

      {/* TODO(Alexandre): <ReviewsList transactionId={...} /> aqui embaixo do cabeçalho. */}

      <div>
        <h2 className="mb-4 text-xl font-bold text-foreground">Anúncios ativos</h2>
        {listings.length === 0 ? (
          <EmptyState
            title="Nenhum anúncio ativo"
            description={
              ehOProprioPerfil
                ? "Seus anúncios ativos aparecem aqui."
                : "Essa pessoa não tem anúncios ativos no momento."
            }
          />
        ) : (
          <ListingGrid>
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                href={`/anuncios/${listing.id}`}
                title={listing.title}
                price={listing.price}
                location={listing.location}
                imageUrl={listing.imageUrl}
                typeLabel={listing.typeLabel}
              />
            ))}
          </ListingGrid>
        )}
      </div>
    </div>
  );
}
