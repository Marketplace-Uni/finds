import type { ReactNode } from "react";
import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";

export type ProfileHeaderProps = {
  name: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  campus?: string | null;
  /** Já formatado pelo `formatLastSeen()`: "ativo há 2h". */
  lastSeen?: string | null;
  /** Média de 0 a 5. `null` quando ainda não há avaliações. */
  rating?: number | null;
  reviewCount?: number;
  /** Ex.: "Editar perfil" no próprio perfil, ou ações do Alexandre no de outros. */
  actionSlot?: ReactNode;
  className?: string;
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
 * Cabeçalho do perfil: avatar, nome, campus, "ativo há" e nota média.
 *
 * Segue o card do anunciante do detalhe do anúncio — avatar com borda limão,
 * nome em negrito e o "última vez visto" logo abaixo — ampliado para a página
 * de perfil (ver docs/DESIGN.md).
 */
export function ProfileHeader({
  name,
  username,
  avatarUrl,
  bio,
  campus,
  lastSeen,
  rating,
  reviewCount = 0,
  actionSlot,
  className,
}: ProfileHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col items-start gap-5 rounded-lg bg-card p-6 sm:flex-row sm:items-center",
        className,
      )}
    >
      <Avatar className="size-24 shrink-0 border-2 border-secondary">
        <AvatarImage src={avatarUrl ?? undefined} alt="" />
        <AvatarFallback className="bg-muted text-xl font-semibold text-foreground">
          {initials(name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">{name}</h1>
        <p className="text-sm text-muted-foreground">{`@${username}`}</p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          {campus ? <span className="text-primary">{campus}</span> : null}
          {lastSeen ? (
            <span className="text-muted-foreground">{lastSeen}</span>
          ) : null}
          {typeof rating === "number" ? (
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-4 fill-secondary text-secondary" aria-hidden />
              {rating.toFixed(1).replace(".", ",")}
              <span className="font-normal text-muted-foreground">
                {reviewCount === 1
                  ? "(1 avaliação)"
                  : `(${reviewCount} avaliações)`}
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">Sem avaliações ainda</span>
          )}
        </div>

        {bio ? (
          <p className="mt-2 text-sm whitespace-pre-line text-foreground">{bio}</p>
        ) : null}
      </div>

      {actionSlot ? <div className="shrink-0">{actionSlot}</div> : null}
    </header>
  );
}
