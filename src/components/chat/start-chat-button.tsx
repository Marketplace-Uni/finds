"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, MessageCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  startConversationFormAction,
  type StartConversationResult,
} from "@/src/lib/chat/actions";

const errorMessages: Record<
  Extract<StartConversationResult, { success: false }>["error"],
  string
> = {
  invalid_listing: "Não foi possível abrir uma conversa para este anúncio.",
  unauthenticated: "Entre na sua conta para conversar com o anunciante.",
  profile_incomplete: "Complete seu perfil para iniciar uma conversa.",
  listing_unavailable: "Este anúncio não está mais disponível.",
  own_listing: "Você não pode iniciar uma conversa no seu próprio anúncio.",
  database_error: "Não foi possível iniciar a conversa. Tente novamente.",
};

export function StartChatButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [result, action, isPending] = useActionState<
    StartConversationResult | null,
    FormData
  >(startConversationFormAction, null);

  useEffect(() => {
    if (result?.success) {
      router.push(`/mensagens?conversation=${encodeURIComponent(result.conversationId)}`);
      return;
    }

    if (result?.error === "unauthenticated") {
      router.push(`/entrar?next=${encodeURIComponent(`/anuncios/${listingId}`)}`);
    } else if (result?.error === "profile_incomplete") {
      router.push(`/completar-perfil?next=${encodeURIComponent(`/anuncios/${listingId}`)}`);
    }
  }, [listingId, result, router]);

  return (
    <div className="flex flex-col items-start gap-2">
      <form action={action}>
        <input type="hidden" name="listing_id" value={listingId} />
        <Button type="submit" disabled={isPending} className="rounded-pill">
          {isPending ? (
            <LoaderCircle className="animate-spin" aria-hidden />
          ) : (
            <MessageCircle aria-hidden />
          )}
          Tenho interesse
        </Button>
      </form>
      {result && !result.success && result.error !== "unauthenticated" &&
      result.error !== "profile_incomplete" ? (
        <p role="alert" className="text-sm text-destructive">
          {errorMessages[result.error]}
        </p>
      ) : null}
    </div>
  );
}
