import type { ReactNode } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format";

export type MatchCardProps = {
  href: string;
  title: string;
  /** Aluguel ou valor da vaga. */
  price?: number | null;
  priceNote?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  /** Compatibilidade de 0 a 1, como o `matchScore()` devolve. `null` = sem perfil. */
  score?: number | null;
  /** Rótulos das tags que as duas pessoas têm em comum. */
  commonTraits?: string[];
  /** `<FavoriteButton>` do Alexandre. */
  favoriteSlot?: ReactNode;
  className?: string;
};

/**
 * Card do match de roommates — o destaque da demo. Mostra o anúncio com o
 * **selo de compatibilidade** e as **tags em comum**, que são o "porquê" do
 * número: sem elas o 87% é só um número solto.
 *
 * Não existe tela para isso no Figma; foi composto a partir do `ListingCard`,
 * dos chips do feed e dos tokens da marca (ver docs/DESIGN.md).
 *
 * É visual: recebe tudo por props, inclusive o score já calculado.
 */
export function MatchCard({
  href,
  title,
  price,
  priceNote,
  location,
  imageUrl,
  score,
  commonTraits = [],
  favoriteSlot,
  className,
}: MatchCardProps) {
  const pct = typeof score === "number" ? Math.round(score * 100) : null;

  return (
    <article className={cn("group relative flex flex-col gap-2", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="grid size-full place-items-center text-muted-foreground"
            aria-hidden
          >
            <ImageOff className="size-8" />
          </div>
        )}

        {pct !== null ? (
          <span className="absolute top-2 left-2 rounded-pill bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-sm">
            {`${pct}% compatível`}
          </span>
        ) : null}

        {favoriteSlot ? (
          <div className="absolute top-2 right-1.5">{favoriteSlot}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-sm leading-tight font-semibold text-foreground">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>

        {typeof price === "number" ? (
          <p className="font-medium text-foreground">
            {formatPrice(price)}
            {priceNote ? (
              <span className="text-xs font-normal text-muted-foreground">
                {" "}
                {priceNote}
              </span>
            ) : null}
          </p>
        ) : null}

        {location ? <p className="text-xs text-primary">{location}</p> : null}

        {commonTraits.length > 0 ? (
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Vocês dois:</span>
            <ul className="flex flex-wrap gap-1.5">
              {commonTraits.map((trait) => (
                <li
                  key={trait}
                  className="rounded-pill bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
                >
                  {trait}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
