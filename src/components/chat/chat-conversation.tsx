"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCheck, Paperclip, Send } from "lucide-react";

import { createClient } from "@/src/lib/supabase/client";
import { formatMessageTime } from "@/src/lib/chat/format";
import { cn } from "@/src/lib/utils";
import type { SendMessageState } from "@/src/app/(main)/mensagens/page";
import type { ChatMessage } from "@/src/components/chat/chat-panel";

/**
 * Balão de mensagem. No Figma os dois lados têm a **mesma cor**; o que muda é
 * o alinhamento e qual canto de baixo fica reto.
 */
function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <li className={cn("flex", message.mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] bg-muted px-3.5 py-2",
          message.mine
            ? "rounded-tl-[14px] rounded-tr-[14px] rounded-bl-[14px]"
            : "rounded-tl-[14px] rounded-tr-[14px] rounded-br-[14px]",
          message.pending && "opacity-60",
          message.failed && "border border-destructive/50",
        )}
      >
        <p className="text-sm whitespace-pre-line text-foreground">{message.content}</p>
        {message.failed ? (
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-medium text-destructive">
            Não foi possível enviar
          </span>
        ) : message.pending ? (
          <span className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-light text-foreground/70">
            enviando...
          </span>
        ) : message.time ? (
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

const initialSendState: SendMessageState = {};

type RealtimeMessageRow = {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read_at: string | null;
};

/**
 * Lista de mensagens + formulário de envio, tudo com estado próprio no
 * cliente — antes disso era renderizado pelo servidor a cada mensagem
 * (`router.refresh()` inteiro na página, ver docs/PLANO-CHAT-REALTIME.md).
 *
 * - Envio otimista: a mensagem aparece na hora, antes da Server Action
 *   confirmar (passo 5 do plano).
 * - Recebimento: aplica o payload do Supabase Realtime direto no estado,
 *   sem pedir nada pro servidor de novo (passo 4).
 * - A mensagem otimista e a real se encontram pelo conteúdo — qualquer um
 *   dos dois caminhos (a Server Action responder, ou o evento Realtime da
 *   própria mensagem chegar) resolve a troca; o outro vira só um no-op.
 */
export function ChatConversation({
  conversationId,
  currentUserId,
  initialMessages,
  action,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  action: (prevState: SendMessageState, formData: FormData) => Promise<SendMessageState>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [state, formAction] = useActionState(action, initialSendState);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "reconnecting"
  >("connecting");

  const seenIds = useRef(new Set(initialMessages.map((message) => message.id)));
  const lastHandledAttempt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  // Assina INSERT (mensagem nova) e UPDATE (`read_at`, quando a outra pessoa
  // lê) — as duas habilitadas na publicação Realtime do Supabase (passo 1).
  useEffect(() => {
    const supabase = createClient();
    let active = true;
    let isConnected = false;

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
          if (!active) return;
          const row = payload.new as RealtimeMessageRow;
          if (seenIds.current.has(row.id)) return;
          seenIds.current.add(row.id);

          const mine = row.sender_id === currentUserId;
          const mensagem: ChatMessage = {
            id: row.id,
            content: row.content,
            time: formatMessageTime(row.created_at),
            mine,
            read: mine && row.read_at !== null,
          };

          setMessages((atual) => {
            if (mine) {
              // Troca a mensagem otimista mais antiga com o mesmo conteúdo —
              // pode ser a própria que esse cliente acabou de mandar.
              const index = atual.findIndex((m) => m.pending && m.content === row.content);
              if (index !== -1) {
                const copia = [...atual];
                copia[index] = mensagem;
                return copia;
              }
            }
            return [...atual, mensagem];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (!active) return;
          const row = payload.new as RealtimeMessageRow;
          setMessages((atual) =>
            atual.map((m) => (m.id === row.id ? { ...m, read: row.read_at !== null } : m)),
          );
        },
      )
      .subscribe((status) => {
        if (!active) return;
        if (status === "SUBSCRIBED") {
          isConnected = true;
          setConnectionStatus("connected");
          return;
        }
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          isConnected = false;
          setConnectionStatus("reconnecting");
        }
      });

    const fallbackPing = setInterval(() => {
      if (!isConnected) setConnectionStatus("reconnecting");
    }, 5000);

    return () => {
      active = false;
      clearInterval(fallbackPing);
      void supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  // Resolve a mensagem otimista com a resposta da própria Server Action —
  // só mexe em algo se o Realtime ainda não tiver chegado primeiro (nesse
  // caso a otimista já não existe mais, e isto vira um no-op).
  //
  // O lint normalmente pede pra "ajustar estado" durante o render em vez de
  // num efeito, mas aqui também precisamos mexer na ref `seenIds` — e o
  // mesmo lint (react-hooks/refs) proíbe ler/escrever ref durante o render.
  // As duas regras puxam pra direções opostas; um efeito reagindo à mudança
  // de `state` (do useActionState) é o jeito correto de resolver isso.
  useEffect(() => {
    if (!state.attempt || state.attempt === lastHandledAttempt.current) return;
    lastHandledAttempt.current = state.attempt;

    /* eslint-disable react-hooks/set-state-in-effect -- precisa mexer na ref
       `seenIds` (proibido durante o render pelo react-hooks/refs), então
       fazer isso num efeito é o jeito correto aqui, não o anti-padrão que
       essa regra normalmente pega. */
    if (state.message) {
      const { id, content, createdAt } = state.message;
      seenIds.current.add(id);
      setMessages((atual) => {
        const index = atual.findIndex((m) => m.pending && m.content === content);
        if (index === -1) return atual;
        const copia = [...atual];
        copia[index] = { id, content, time: formatMessageTime(createdAt), mine: true, read: false };
        return copia;
      });
    } else if (state.error) {
      setMessages((atual) => {
        const index = atual.map((m) => m.pending).lastIndexOf(true);
        if (index === -1) return atual;
        const copia = [...atual];
        copia[index] = { ...copia[index], pending: false, failed: true };
        return copia;
      });
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [state]);

  // Rola pro fim sempre que uma mensagem é adicionada (otimista ou real).
  useEffect(() => {
    const lista = document.getElementById("chat-mensagens");
    if (!lista) return;
    const frame = requestAnimationFrame(() => {
      lista.scrollTop = lista.scrollHeight;
    });
    return () => cancelAnimationFrame(frame);
  }, [messages.length]);

  function enviar(formData: FormData) {
    const conteudo = String(formData.get("content") ?? "").trim();
    if (!conteudo) return;

    setMessages((atual) => [
      ...atual,
      { id: `temp-${crypto.randomUUID()}`, content: conteudo, mine: true, pending: true },
    ]);
    formRef.current?.reset();
    formAction(formData);
  }

  return (
    <>
      {connectionStatus !== "connected" ? (
        <p
          role="status"
          aria-live="polite"
          className={cn(
            "px-4 text-xs",
            connectionStatus === "reconnecting" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {connectionStatus === "connecting"
            ? "Conectando ao chat em tempo real..."
            : "Reconectando ao chat. As mensagens serão sincronizadas automaticamente."}
        </p>
      ) : null}

      <ul id="chat-mensagens" className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </ul>

      <form ref={formRef} action={enviar} className="flex items-center gap-2 px-4 pb-4">
        <div className="flex flex-1 items-center gap-2 rounded-pill bg-input px-4 py-2.5">
          <label htmlFor="chat-mensagem" className="sr-only">
            Mensagem
          </label>
          <input
            id="chat-mensagem"
            name="content"
            autoComplete="off"
            placeholder="Digite seu texto..."
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
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
          className="grid size-11 shrink-0 place-items-center rounded-pill bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Send className="size-5" aria-hidden />
        </button>
      </form>
    </>
  );
}
