import { Suspense } from "react";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { EmptyState, ErrorState, LoadingState } from "@/src/components/ui/states";
import { createClient } from "@/src/lib/supabase/server";

export function ReviewsList({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<LoadingState description="Carregando avaliações..." />}>
      <ReviewsContent userId={userId} />
    </Suspense>
  );
}

async function ReviewsContent({ userId }: { userId: string }) {
  const supabase = await createClient();
  const { data: reviewRows, error: reviewsError } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, reviewer_id")
    .eq("reviewed_id", userId)
    .order("created_at", { ascending: false });

  if (reviewsError) {
    return (
      <ErrorState description="Não foi possível carregar as avaliações. Tente novamente." />
    );
  }

  const reviews = (reviewRows ?? []).filter(
    (review) =>
      typeof review.rating === "number" &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      review.reviewer_id,
  );

  if (!reviews.length) {
    return (
      <EmptyState
        title="Ainda não há avaliações"
        description="Quando alguém avaliar uma negociação concluída com esta pessoa, a avaliação aparecerá aqui."
      />
    );
  }

  const reviewerIds = [
    ...new Set(reviews.flatMap((review) => (review.reviewer_id ? [review.reviewer_id] : []))),
  ];
  const { data: reviewerRows, error: reviewersError } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", reviewerIds);

  if (reviewersError) {
    return (
      <ErrorState description="Não foi possível carregar os autores das avaliações. Tente novamente." />
    );
  }

  const reviewersById = new Map((reviewerRows ?? []).map((reviewer) => [reviewer.id, reviewer]));
  const averageRating =
    reviews.reduce((total, review) => total + (review.rating ?? 0), 0) / reviews.length;

  return (
    <section className="space-y-4" aria-labelledby="reviews-heading">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="reviews-heading" className="text-xl font-bold text-foreground">
          Avaliações
        </h2>
        <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Star className="size-4 fill-secondary text-secondary" aria-hidden />
          {averageRating.toFixed(1).replace(".", ",")}
          <span className="font-normal text-muted-foreground">
            {reviews.length === 1 ? "(1 avaliação)" : `(${reviews.length} avaliações)`}
          </span>
        </p>
      </header>

      <ul className="grid gap-3">
        {reviews.map((review) => {
          const reviewer = review.reviewer_id
            ? reviewersById.get(review.reviewer_id)
            : undefined;
          const reviewerName: string =
            reviewer?.full_name || reviewer?.username || "Pessoa do Finds";
          const reviewDate = review.created_at
            ? new Date(review.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            : null;

          return (
            <li
              key={review.id}
              className="rounded-lg border border-border bg-card p-4"
            >
              <article className="flex items-start gap-3">
                <Avatar className="size-10 shrink-0 border border-secondary">
                  <AvatarImage src={reviewer?.avatar_url ?? undefined} alt="" />
                  <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                    {reviewerName
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <p className="font-semibold text-foreground">{reviewerName}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className="flex items-center gap-1 font-medium text-foreground"
                        aria-label={`${review.rating} de 5 estrelas`}
                      >
                        <Star className="size-4 fill-secondary text-secondary" aria-hidden />
                        {review.rating}
                      </span>
                      {reviewDate ? (
                        <time
                          dateTime={review.created_at ?? undefined}
                          className="text-muted-foreground"
                        >
                          {reviewDate}
                        </time>
                      ) : null}
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="mt-2 whitespace-pre-line text-sm text-foreground">
                      {review.comment}
                    </p>
                  ) : null}
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
