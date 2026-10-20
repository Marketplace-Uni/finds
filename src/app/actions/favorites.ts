"use server";

import { revalidatePath } from "next/cache";

import { requireCompleteProfile, rotaSegura } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { favoriteActionSchema } from "@/src/lib/validations/favorites";

export type FavoriteActionState = {
  error?: string;
  /** Estado final depois da troca, pra saber qual toast mostrar. */
  favorited?: boolean;
  /** Incrementa a cada chamada — o cliente usa isso pra disparar o toast só
   * uma vez por submissão, não a cada re-render. */
  attempt?: number;
};

export async function toggleFavoriteAction(
  prevState: FavoriteActionState,
  formData: FormData,
): Promise<FavoriteActionState> {
  const attempt = (prevState.attempt ?? 0) + 1;

  const parsed = favoriteActionSchema.safeParse({
    listingId: formData.get("listing_id"),
    favorite: formData.get("favorite"),
    returnTo: formData.get("return_to"),
  });

  if (!parsed.success) {
    return { error: "Não foi possível identificar o anúncio favorito.", attempt };
  }

  // `requireCompleteProfile` redireciona (lança o erro especial de redirect
  // do Next) se não houver sessão ou perfil completo — isso não deve virar
  // `{ error }`, tem que propagar normalmente pra navegação acontecer.
  const returnTo = rotaSegura(parsed.data.returnTo);
  const profile = await requireCompleteProfile(returnTo);
  const supabase = await createClient();

  if (parsed.data.favorite === "false") {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", profile.id)
      .eq("listing_id", parsed.data.listingId);

    if (error) return { error: "Não foi possível remover o anúncio dos favoritos.", attempt };
  } else {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id, status")
      .eq("id", parsed.data.listingId)
      .maybeSingle();

    if (listingError) return { error: "Não foi possível verificar o anúncio.", attempt };
    if (!listing || listing.status !== "active") {
      return { error: "Este anúncio não está disponível para favoritar.", attempt };
    }
    if (listing.owner_id === profile.id) {
      return { error: "Você não pode favoritar seu próprio anúncio.", attempt };
    }

    const { error } = await supabase.from("favorites").upsert(
      {
        user_id: profile.id,
        listing_id: parsed.data.listingId,
      },
      { onConflict: "user_id,listing_id", ignoreDuplicates: true },
    );

    if (error) return { error: "Não foi possível adicionar o anúncio aos favoritos.", attempt };
  }

  revalidatePath(returnTo.split("?")[0]);
  revalidatePath("/favoritos");

  return { favorited: parsed.data.favorite === "true", attempt };
}
