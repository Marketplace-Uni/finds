import { Heart } from "lucide-react";

import { toggleFavoriteAction } from "@/src/app/actions/favorites";
import { OverlayIconButton } from "@/src/components/ui/overlay-icon-button";

export function FavoriteButton({
  listingId,
  isFavorite = false,
  returnTo = "/",
}: {
  listingId: string;
  isFavorite?: boolean;
  returnTo?: string;
}) {
  return (
    <form action={toggleFavoriteAction} className="relative z-10">
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="favorite" value={String(!isFavorite)} />
      <input type="hidden" name="return_to" value={returnTo} />
      <OverlayIconButton
        type="submit"
        aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        aria-pressed={isFavorite}
        title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        <Heart
          aria-hidden
          className={isFavorite ? "fill-primary text-primary" : undefined}
        />
      </OverlayIconButton>
    </form>
  );
}
