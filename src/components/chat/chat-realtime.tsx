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
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting"
  >("connecting");
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const seenMessageIds = new Set<string>();
    let active = true;
    let isConnected = false;

    const scheduleRefresh = () => {
      if (!active || refreshTimer.current) return;
      refreshTimer.current = setTimeout(() => {
        refreshTimer.current = null;
        if (active) router.refresh();
      }, 100);
    };

    const refreshForCatchUp = () => {
      if (active) router.refresh();
    };

    const handleOffline = () => {
      isConnected = false;
      setConnectionStatus("reconnecting");
    };

    const handleOnline = () => {
      setConnectionStatus("reconnecting");
      refreshForCatchUp();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshForCatchUp();
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

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
        (payload) => {
          const messageId =
            typeof payload.new.id === "string" ? payload.new.id : null;
          if (messageId && seenMessageIds.has(messageId)) return;
          if (messageId) {
            seenMessageIds.add(messageId);
            if (seenMessageIds.size > 500) {
              const oldestMessageId = seenMessageIds.values().next().value;
              if (oldestMessageId) seenMessageIds.delete(oldestMessageId);
            }
          }

          scheduleRefresh();
        },
      )
      .subscribe((status) => {
        if (!active) return;

        if (status === "SUBSCRIBED") {
          isConnected = true;
          setConnectionStatus("connected");
          refreshForCatchUp();
          return;
        }

        if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT" ||
          status === "CLOSED"
        ) {
          isConnected = false;
          setConnectionStatus("reconnecting");
        }
      });

    const fallbackRefresh = setInterval(() => {
      if (!isConnected) refreshForCatchUp();
    }, 5000);

    return () => {
      active = false;
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(fallbackRefresh);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
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

  if (connectionStatus === "connected") return null;

  return (
    <p
      role="status"
      aria-live="polite"
      className={
        connectionStatus === "reconnecting"
          ? "text-xs text-destructive"
          : "text-xs text-muted-foreground"
      }
    >
      {connectionStatus === "connecting"
        ? "Conectando ao chat em tempo real..."
        : "Reconectando ao chat. As mensagens serão sincronizadas automaticamente."}
    </p>
  );
}
