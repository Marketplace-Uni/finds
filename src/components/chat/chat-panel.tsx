import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCheck, Paperclip, Send } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { ChatConversation } from "@/src/components/chat/chat-conversation";
import { cn } from "@/src/lib/utils";
import type { SendMessageState } from "@/src/app/(main)/mensagens/page";

export type ChatMessage = {
  id: string;
  content: string;
  /** Já formatado: "12:00". */
  time?: string | null;
  /** true = enviada por quem está vendo. */
  mine?: boolean;
  /** Mostra o duplo check nas próprias mensagens. */
  read?: boolean;
  /** Mensagem otimista: ainda esperando a Server Action confirmar. */
  pending?: boolean;
  /** O envio falhou — mostra aviso em vez de simplesmente sumir. */
  failed?: boolean;
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
  peer: ChatPeer;
  messages: ChatMessage[];
  /** Volta para a lista — só aparece no mobile, onde os painéis não convivem. */
  backHref?: string;
  /**
   * Server action que envia a mensagem. Com `conversationId`/`currentUserId`
   * também presentes, é a action no formato de `useActionState`
   * (`(prevState, formData) => Promise<SendMessageState>`) usada pelo
   * `ChatConversation` (tempo real + envio otimista). Sem esses dois, vira
   * uma ação de formulário comum — é o caso do `/preview-visual`, que só
   * mostra o visual estático, sem conversa de verdade por trás.
   */
  action?:
    | React.ComponentProps<"form">["action"]
    | ((prevState: SendMessageState, formData: FormData) => Promise<SendMessageState>);
  /** Presente só na conversa de verdade (não no preview estático). */
  conversationId?: string;
  currentUserId?: string;
  /** Card de status da negociação, entre o cabeçalho e as mensagens. */
  headerSlot?: ReactNode;
  className?: string;
};

/**
 * Painel direito do chat: cabeçalho escuro com a outra pessoa, as mensagens e
 * o campo de envio em pílula, como no Figma.
 *
 * Com `conversationId`/`currentUserId`, as mensagens e o envio ficam por
 * conta do `ChatConversation` (client, tempo real + otimista). Sem eles,
 * cai num `<ul>`/`<form>` estáticos — só usado pelo `/preview-visual`, que
 * não tem uma conversa de verdade por trás.
 */
export function ChatPanel({
  peer,
  messages,
  backHref,
  action,
  conversationId,
  currentUserId,
  headerSlot,
  className,
}: ChatPanelProps) {
  const live = conversationId && currentUserId;
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
            className="grid size-8 shrink-0 place-items-center rounded-pill text-nav-foreground hover:bg-primary/60 hover:text-primary-foreground lg:hidden"
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

      {live ? (
        <ChatConversation
          conversationId={conversationId}
          currentUserId={currentUserId}
          peerName={peer.name}
          initialMessages={messages}
          action={
            action as (
              prevState: SendMessageState,
              formData: FormData,
            ) => Promise<SendMessageState>
          }
        />
      ) : (
        <>
          <ul
            id="chat-mensagens"
            className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
          >
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </ul>

          <form
            action={action as React.ComponentProps<"form">["action"]}
            className="flex items-center gap-2 px-4 pb-4"
          >
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
      )}
    </section>
  );
}
