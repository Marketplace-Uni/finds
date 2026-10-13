"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { useCompleteProfileGate } from "@/src/components/auth/complete-profile-gate";
import { Button } from "@/src/components/ui/button";
import { startConversation } from "@/src/lib/chat/actions";

const errors: Record<string, string> = {
  invalid_listing: "Este anúncio não é válido.",
  unauthenticated: "Entre novamente para iniciar uma conversa.",
  profile_incomplete: "Complete seu perfil para conversar.",
  listing_unavailable: "Este anúncio não está mais disponível.",
  own_listing: "Você não pode iniciar uma conversa no seu próprio anúncio.",
  database_error: "Não foi possível iniciar a conversa. Tente novamente.",
};

export function StartChatButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const { isComplete, requireComplete } = useCompleteProfileGate();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!isComplete) {
      requireComplete(() => undefined);
      return;
    }

    startTransition(async () => {
      const result = await startConversation(listingId);
      if (!result.success) {
        setError(errors[result.error]);
        return;
      }

      router.push(
        `/mensagens?conversation=${encodeURIComponent(result.conversationId)}`,
      );
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        className="w-full rounded-pill"
        onClick={handleClick}
        disabled={isPending}
      >
        <MessageCircle aria-hidden />
        {isPending ? "Abrindo conversa..." : "Tenho interesse"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
