import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { EmptyState } from "@/src/components/ui/states";
import { cn } from "@/src/lib/utils";

export type Conversation = {
  id: string;
  href: string;
  /** A outra pessoa da conversa. */
  name: string;
  avatarUrl?: string | null;
  /** Anúncio que originou a conversa. */
  listingTitle?: string | null;
  lastMessage: string;
  /** Já formatado: "12:00", "ontem". */
  time?: string | null;
  unread?: boolean;
  /** Conversa aberta agora. */
  active?: boolean;
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
 * Painel esquerdo do chat: "Suas conversas". No mobile é uma tela inteira que
 * leva para a conversa; no desktop fica lado a lado com ela (docs/DESIGN.md).
 */
export function ConversationList({
  conversations,
  className,
}: {
  conversations: Conversation[];
  className?: string;
}) {
  return (
    <aside className={cn("flex w-full flex-col gap-3 lg:w-80 lg:shrink-0", className)}>
      <header>
        <h1 className="text-lg font-bold text-foreground">Suas conversas</h1>
        <p className="text-sm text-muted-foreground">
          Aqui é seu espaço para conversar e negociar!
        </p>
      </header>

      {conversations.length === 0 ? (
        <EmptyState
          title="Nenhuma conversa ainda"
          description="Quando você falar com alguém sobre um anúncio, a conversa aparece aqui."
          // Aqui não houve busca nenhuma, então o Zeca da lupa não cabe.
          pose={1}
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {conversations.map((conversa) => (
            <li key={conversa.id}>
              <Link
                href={conversa.href}
                aria-current={conversa.active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 transition-colors",
                  conversa.active ? "bg-card" : "hover:bg-card/60",
                )}
              >
                <Avatar className="size-11 shrink-0 border-2 border-secondary">
                  <AvatarImage src={conversa.avatarUrl ?? undefined} alt="" />
                  <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                    {initials(conversa.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={cn(
                        "truncate text-sm text-foreground",
                        conversa.unread ? "font-bold" : "font-semibold",
                      )}
                    >
                      {conversa.name}
                    </span>
                    {conversa.time ? (
                      <span className="w-12 shrink-0 text-right text-[10px] text-muted-foreground">
                        {conversa.time}
                      </span>
                    ) : null}
                  </div>

                  {conversa.listingTitle ? (
                    <p className="truncate text-xs text-primary">
                      {conversa.listingTitle}
                    </p>
                  ) : null}

                  <p
                    className={cn(
                      "truncate text-xs",
                      conversa.unread
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {conversa.lastMessage}
                  </p>
                </div>

                {conversa.unread ? (
                  <span
                    className="size-2.5 shrink-0 rounded-pill bg-primary"
                    aria-label="Mensagem não lida"
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
