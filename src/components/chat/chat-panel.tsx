"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Paperclip, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  markConversationMessagesRead,
  type ChatMessageActionResult,
} from "@/src/lib/chat/actions";
import { formatMessageTime } from "@/src/lib/chat/format-message-time";
import { createClient } from "@/src/lib/supabase/client";
import { cn } from "@/src/lib/utils";

export type ChatMessage = {
  id: string;
  content: string;
  createdAt?: string;
  /** Já formatado: "12:00". */
  time?: string | null;
  /** true = enviada por quem está vendo. */
  mine?: boolean;
  /** Mostra o duplo check nas próprias mensagens. */
  read?: boolean;
};

export type ChatPeer = {
  name: string;
  avatarUrl?: string | null;
  /** Já formatado pelo `formatLastSeen()`: "última vez visto às 14:59". */
  lastSeen?: string | null;
  profileHref?: string;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function isMessageRow(
  value: unknown,
): value is {
  id: string;
  content: string;
  sender_id: string | null;
  read_at: string | null;
  created_at: string;
} {
  if (!value || typeof value !== "object") return false;

  const row = value as Record<string, unknown>;
  return (
    typeof row.id === "string" &&
    typeof row.content === "string" &&
    (typeof row.sender_id === "string" || row.sender_id === null) &&
    (typeof row.read_at === "string" || row.read_at === null) &&
    typeof row.created_at === "string"
  );
}

function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]) {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  for (const message of incoming) {
    messagesById.set(message.id, { ...messagesById.get(message.id), ...message });
  }

  return [...messagesById.values()].sort((left, right) =>
    (left.createdAt ?? "").localeCompare(right.createdAt ?? ""),
  );
}

type ChatMessageActionError = Extract<
  ChatMessageActionResult,
  { success: false }
>["error"];

function sendErrorMessage(error: ChatMessageActionError) {
  switch (error) {
    case "invalid_message":
      return "Digite uma mensagem com até 2.000 caracteres.";
    case "unauthenticated":
      return "Sua sessão expirou. Entre novamente para enviar mensagens.";
    case "conversation_unavailable":
      return "Esta conversa não está disponível para sua conta.";
    default:
      return "Não foi possível enviar a mensagem. Tente novamente.";
  }
}

/**
 * Balão de mensagem. No Figma os dois lados têm a **mesma cor**; o que muda é
 * o alinhamento e qual canto de baixo fica reto.
 */
export function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <li className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] bg-muted px-3.5 py-2",
          message.mine
            ? "rounded-tl-[14px] rounded-tr-[14px] rounded-bl-[14px]"
            : "rounded-tl-[14px] rounded-tr-[14px] rounded-br-[14px]",
        )}
      >
        <p className="text-sm whitespace-pre-line text-foreground">{message.content}</p>
        {message.time ? (
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-light text-foreground/70">
            {message.time}
            {message.mine ? (
              <CheckCheck
                className={cn("size-3", message.read ? "text-primary" : "opacity-50")}
                aria-label={message.read ? "Lida" : "Enviada"}
              />
            ) : null}
          </span>
        ) : null}
      </div>
    </li>
  );
}

type ChatPanelProps = {
	conversationId?: string;
	userId?: string;
  peer: ChatPeer;
  messages: ChatMessage[];
  /** Volta para a lista — só aparece no mobile, onde os painéis não convivem. */
  backHref?: string;
  /** Server action que envia a mensagem. */
  onSend?: (content: string) => Promise<ChatMessageActionResult>;
  /** Card de status da negociação, entre o cabeçalho e as mensagens. */
  headerSlot?: ReactNode;
  className?: string;
};

/**
 * Painel direito do chat: cabeçalho escuro com a outra pessoa, as mensagens e
 * o campo de envio em pílula, como no Figma.
 *
 * Mantém a assinatura Realtime e o estado das mensagens no navegador.
 */
export function ChatPanel({
  conversationId,
  userId,
  peer,
  messages,
  backHref,
  onSend,
  headerSlot,
  className,
}: ChatPanelProps) {
  const [liveMessages, setLiveMessages] = useState(messages);
  const [isSending, startSending] = useTransition();
  const [sendError, setSendError] = useState<string | null>(null);
  const [realtimeError, setRealtimeError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    const activeConversationId = conversationId;
    const currentUserId = userId;
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${activeConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          if (!isMessageRow(payload.new)) return;

          if (payload.eventType === "INSERT") {
            const row = payload.new;
            const message: ChatMessage = {
              id: row.id,
              content: row.content,
              createdAt: row.created_at,
              time: formatMessageTime(row.created_at),
              mine: row.sender_id === currentUserId,
              read: row.sender_id === currentUserId && row.read_at !== null,
            };
            setLiveMessages((current) => mergeMessages(current, [message]));

            if (row.sender_id !== currentUserId) {
              void markConversationMessagesRead(activeConversationId)
                .then((result) => {
                  if (!result.success) {
                    setRealtimeError("Não foi possível atualizar o estado de leitura.");
                  }
                })
                .catch(() => {
                  setRealtimeError("Não foi possível atualizar o estado de leitura.");
                });
            }
          } else if (
            payload.eventType === "UPDATE" &&
            payload.new.sender_id === currentUserId &&
            payload.new.read_at
          ) {
            setLiveMessages((current) =>
              current.map((message) =>
                message.id === payload.new.id ? { ...message, read: true } : message,
              ),
            );
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeError(null);
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeError("Não foi possível conectar ao chat em tempo real.");
        } else if (status === "CLOSED") {
          setRealtimeError("A conexão em tempo real foi encerrada.");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [liveMessages]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onSend || !userId) return;

    const send = onSend;
    const currentUserId = userId;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const content = String(formData.get("content") ?? "");

    startSending(async () => {
      try {
        const result = await send(content);
        if (!result.success) {
          setSendError(sendErrorMessage(result.error));
          return;
        }

        const message = result.message;
        setLiveMessages((current) =>
          mergeMessages(current, [
            {
              id: message.id,
              content: message.content,
              createdAt: message.created_at,
              time: formatMessageTime(message.created_at),
              mine: message.sender_id === currentUserId,
              read: message.read_at !== null,
            },
          ]),
        );
        setSendError(null);
        form.reset();
      } catch {
        setSendError("Não foi possível enviar a mensagem. Tente novamente.");
      }
    });
  }

  return (
    <section
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg bg-background",
        className,
      )}
    >
      <header className="flex items-center gap-3 rounded-lg bg-nav px-4 py-3">
        {backHref ? (
          <Link
            href={backHref}
            className="grid size-8 shrink-0 place-items-center rounded-pill text-nav-foreground hover:bg-white/10 lg:hidden"
            aria-label="Voltar para as conversas"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
        ) : null}

        <Avatar className="size-10 shrink-0 border-2 border-secondary">
          <AvatarImage src={peer.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
            {initials(peer.name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0">
          {peer.profileHref ? (
            <Link
              href={peer.profileHref}
              className="block truncate text-sm font-medium text-nav-foreground hover:underline"
            >
              {peer.name}
            </Link>
          ) : (
            <span className="block truncate text-sm font-medium text-nav-foreground">
              {peer.name}
            </span>
          )}
          {peer.lastSeen ? (
            <span className="block truncate text-[10px] font-light text-nav-foreground/80">
              {peer.lastSeen}
            </span>
          ) : null}
        </div>
      </header>

      {headerSlot ? <div className="px-4 pt-4">{headerSlot}</div> : null}

      <ul
        id="chat-mensagens"
        className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
        aria-live="polite"
        aria-relevant="additions"
      >
        {liveMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        <li ref={messagesEndRef} aria-hidden />
      </ul>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 pb-4">
        <div className="flex flex-1 items-center gap-2 rounded-pill bg-input px-4 py-2.5">
          <label htmlFor="chat-mensagem" className="sr-only">
            Mensagem
          </label>
          <input
            id="chat-mensagem"
            name="content"
            maxLength={2000}
            required
            autoComplete="off"
            placeholder="Digite seu texto..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled={isSending}
          />
          <button
            type="button"
            aria-label="Anexar arquivo"
            className="grid size-7 shrink-0 place-items-center rounded-pill text-muted-foreground hover:text-foreground"
          >
            <Paperclip className="size-4" aria-hidden />
          </button>
        </div>
        <button
          type="submit"
          aria-label="Enviar mensagem"
          disabled={isSending}
          className="grid size-11 shrink-0 place-items-center rounded-pill bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Send className="size-5" aria-hidden />
        </button>
      </form>
      {sendError || realtimeError ? (
        <div className="px-4 pb-3 text-sm text-destructive" role="alert">
          {sendError ?? realtimeError}
        </div>
      ) : null}
    </section>
  );
}
