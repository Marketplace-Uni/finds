"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCompleteProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { reviewSchema } from "@/src/lib/validations/reviews";

export async function createReviewAction(formData: FormData) {
  const parsed = reviewSchema.safeParse({
    transactionId: formData.get("transaction_id"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) throw new Error("Confira a nota e o comentário da avaliação.");

  const returnTo = "/mensagens";
  const profile = await requireCompleteProfile(returnTo);
  const supabase = await createClient();

  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .select("id, buyer_id, seller_id, status, conversation_id")
    .eq("id", parsed.data.transactionId)
    .maybeSingle();

  if (transactionError) throw new Error("Não foi possível verificar a negociação.");
  if (!transaction || transaction.status !== "completed") {
    throw new Error("Só é possível avaliar uma negociação concluída.");
  }
  if (transaction.buyer_id !== profile.id && transaction.seller_id !== profile.id) {
    throw new Error("Você não participa desta negociação.");
  }

  const reviewedId =
    transaction.buyer_id === profile.id ? transaction.seller_id : transaction.buyer_id;
  if (!reviewedId || reviewedId === profile.id) {
    throw new Error("Não foi possível identificar a outra pessoa da negociação.");
  }

  const [{ data: existingReview, error: existingReviewError }, { data: reviewedProfile, error: profileError }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("id")
        .eq("transaction_id", transaction.id)
        .eq("reviewer_id", profile.id)
        .maybeSingle(),
      supabase.from("profiles").select("username").eq("id", reviewedId).maybeSingle(),
    ]);

  if (existingReviewError) throw new Error("Não foi possível verificar sua avaliação.");
  if (profileError) throw new Error("Não foi possível carregar o perfil avaliado.");
  if (existingReview) throw new Error("Você já avaliou esta negociação.");

  const { error: insertError } = await supabase.from("reviews").insert({
    transaction_id: transaction.id,
    reviewer_id: profile.id,
    reviewed_id: reviewedId,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null,
  });

  if (insertError) throw new Error("Não foi possível enviar a avaliação. Tente novamente.");

  revalidatePath("/mensagens");
  revalidatePath("/negociacoes");
  if (reviewedProfile?.username) {
    revalidatePath(`/perfil/${reviewedProfile.username}`);
  }

  if (transaction.conversation_id) {
    redirect(`/mensagens?conversation=${encodeURIComponent(transaction.conversation_id)}`);
  }
}
