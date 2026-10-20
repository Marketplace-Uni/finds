import { notFound, redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import { fetchCampusOptions } from "@/src/lib/listings";
import { EditarForm } from "./editar-form";

export default async function EditarAnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      "id, owner_id, type, title, description, price, campus_id, details, listing_images(path, position)",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !listing) {
    notFound();
  }

  // Só o dono pode editar.
  if (listing.owner_id !== user.id) {
    redirect("/");
  }

  const campuses = await fetchCampusOptions();

  const images = [...(listing.listing_images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((image) => ({
      path: image.path,
      url: supabase.storage.from("listing-images").getPublicUrl(image.path).data.publicUrl,
    }));

  return (
    <EditarForm
      listing={{
        id: listing.id,
        type: listing.type,
        title: listing.title,
        description: listing.description ?? "",
        price: listing.price,
        campus_id: listing.campus_id,
        details: (listing.details as Record<string, unknown>) ?? {},
        images,
      }}
      campuses={campuses}
    />
  );
}
