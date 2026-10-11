"use server";

import { revalidatePath } from "next/cache";

import { requireCompleteProfile, rotaSegura } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { favoriteActionSchema } from "@/src/lib/validations/favorites";

export async function toggleFavoriteAction(formData: FormData) {
  const parsed = favoriteActionSchema.safeParse({
    listingId: formData.get("listing_id"),
    favorite: formData.get("favorite"),
    returnTo: formData.get("return_to"),
  });

  if (!parsed.success) throw new Error("Não foi possível identificar o anúncio favorito.");

  const returnTo = rotaSegura(parsed.data.returnTo);
  const profile = await requireCompleteProfile(returnTo);
  const supabase = await createClient();

  if (parsed.data.favorite === "false") {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", profile.id)
      .eq("listing_id", parsed.data.listingId);

    if (error) throw new Error("Não foi possível remover o anúncio dos favoritos.");
  } else {
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id, status")
      .eq("id", parsed.data.listingId)
      .maybeSingle();

    if (listingError) throw new Error("Não foi possível verificar o anúncio.");
    if (!listing || listing.status !== "active") {
      throw new Error("Este anúncio não está disponível para favoritar.");
    }
    if (listing.owner_id === profile.id) {
      throw new Error("Você não pode favoritar seu próprio anúncio.");
    }

    const { error } = await supabase.from("favorites").upsert(
      {
        user_id: profile.id,
        listing_id: parsed.data.listingId,
      },
      { onConflict: "user_id,listing_id", ignoreDuplicates: true },
    );

    if (error) throw new Error("Não foi possível adicionar o anúncio aos favoritos.");
  }

  revalidatePath(returnTo.split("?")[0]);
  revalidatePath("/favoritos");
}
