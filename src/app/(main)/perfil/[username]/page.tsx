import Link from "next/link";

import { getCurrentProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { fetchUserListings } from "@/src/lib/listings";
import { formatLastSeen } from "@/src/lib/format";
import { ProfileHeader } from "@/src/components/profile/profile-header";
import { ReviewsList } from "@/src/components/profile/reviews-list";
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

  const [viewer, listings, { data: ratingRows }] = await Promise.all([
    getCurrentProfile(),
    fetchUserListings(profile.id),
    supabase.from("reviews").select("rating").eq("reviewed_id", profile.id),
  ]);

  const campus = Array.isArray(profile.campuses) ? profile.campuses[0] : profile.campuses;
  const ehOProprioPerfil = viewer?.id === profile.id;

  // Mesmo cálculo do `<ReviewsList>` (que ainda busca os dados completos das
  // avaliações pra listar cada uma) — aqui é só o resumo compacto que entra
  // ao lado do campus/"ativo há X" no cabeçalho do perfil.
  const ratings = (ratingRows ?? []).filter(
    (row): row is { rating: number } => typeof row.rating === "number",
  );
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((total, row) => total + row.rating, 0) / ratings.length
      : null;

  return (
    <div className="flex flex-col gap-8 animate-[finds-fade-in_0.35s_ease-out]">
      {/*
        Keyframe inline em vez de global.css: anima só a entrada desta
        página, sem mexer no tema (área do Caike). Ver mesmo padrão em
        /anuncios/[id].
      */}
      <style>{`@keyframes finds-fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      <ProfileHeader
        name={profile.full_name ?? profile.username ?? "Sem nome"}
        username={profile.username ?? ""}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        campus={campus?.name ?? null}
        lastSeen={formatLastSeen(profile.last_seen_at)}
        rating={averageRating}
        reviewCount={ratings.length}
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

      <ReviewsList userId={profile.id} />

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
