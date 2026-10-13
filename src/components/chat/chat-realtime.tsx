"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/src/lib/supabase/client";

export function ChatRealtime({
  conversationId,
  messageCount,
}: {
  conversationId: string;
  messageCount: number;
}) {
  const router = useRouter();
  const [connectionError, setConnectionError] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          if (refreshTimer.current) clearTimeout(refreshTimer.current);
          refreshTimer.current = setTimeout(() => router.refresh(), 100);
        },
      )
      .subscribe((status) => {
        setConnectionError(status === "CHANNEL_ERROR" || status === "TIMED_OUT");
      });

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  useEffect(() => {
    const messageList = document.getElementById("chat-mensagens");
    if (!messageList) return;

    const frame = requestAnimationFrame(() => {
      messageList.scrollTop = messageList.scrollHeight;
    });

    return () => cancelAnimationFrame(frame);
  }, [messageCount]);

  return connectionError ? (
    <p role="status" className="text-xs text-destructive">
      Não foi possível conectar ao chat em tempo real. As mensagens podem demorar para aparecer.
    </p>
  ) : null;
}
