"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { reportSchema } from "@/src/lib/validations/reports";

export async function createReportAction(formData: FormData) {
  const parsed = reportSchema.safeParse({
    listingId: formData.get("listing_id"),
    reason: formData.get("reason"),
    description: formData.get("description"),
  });

  if (!parsed.success) throw new Error("Confira o motivo e a descrição da denúncia.");

  const user = await requireUser(`/anuncios/${parsed.data.listingId}`);
  const supabase = await createClient();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, owner_id, status")
    .eq("id", parsed.data.listingId)
    .maybeSingle();

  if (listingError) throw new Error("Não foi possível verificar o anúncio denunciado.");
  if (!listing || listing.status !== "active") {
    throw new Error("Este anúncio não está disponível para denúncia.");
  }
  if (listing.owner_id === user.id) {
    throw new Error("Você não pode denunciar seu próprio anúncio.");
  }

  const { error } = await supabase.from("reports").insert({
    listing_id: listing.id,
    reporter_id: user.id,
    reason: parsed.data.reason,
    description: parsed.data.description || null,
  });

  if (error) throw new Error("Não foi possível enviar a denúncia. Tente novamente.");

  revalidatePath(`/anuncios/${listing.id}`);
}
