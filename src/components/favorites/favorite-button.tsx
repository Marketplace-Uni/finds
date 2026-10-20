"use client";

import { useActionState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { toggleFavoriteAction, type FavoriteActionState } from "@/src/app/actions/favorites";
import { OverlayIconButton } from "@/src/components/ui/overlay-icon-button";

const initialState: FavoriteActionState = {};

export function FavoriteButton({
  listingId,
  isFavorite = false,
  returnTo = "/",
}: {
  listingId: string;
  isFavorite?: boolean;
  returnTo?: string;
}) {
  const [state, formAction, isPending] = useActionState(toggleFavoriteAction, initialState);
  const ultimoAvisado = useRef(0);

  useEffect(() => {
    if (!state.attempt || state.attempt === ultimoAvisado.current) return;
    ultimoAvisado.current = state.attempt;

    if (state.error) {
      toast.error(state.error);
    } else if (state.favorited === true) {
      toast.success("Adicionado aos favoritos!");
    } else if (state.favorited === false) {
      toast("Removido dos favoritos.");
    }
  }, [state]);

  return (
    <form action={formAction} className="relative z-10">
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="favorite" value={String(!isFavorite)} />
      <input type="hidden" name="return_to" value={returnTo} />
      <OverlayIconButton
        type="submit"
        disabled={isPending}
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
