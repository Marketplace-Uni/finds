import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format";
import {
  ListingStatusBadge,
  type ListingStatus,
} from "@/src/components/listings/listing-status-badge";

export type ListingCardProps = {
  href: string;
  title: string;
  price?: number | null;
  priceNote?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  typeLabel?: string | null;
  status?: ListingStatus | null;
  actionsSlot?: ReactNode;
  favoriteSlot?: ReactNode;
  className?: string;
  /** Define se a imagem deve ser pré-carregada (ideal para os primeiros itens do feed) */
  priority?: boolean;
};

export function ListingCard({
  href,
  title,
  price,
  priceNote,
  location,
  imageUrl,
  typeLabel,
  status,
  actionsSlot,
  favoriteSlot,
  className,
  priority = false,
}: ListingCardProps) {
  return (
    <article className={cn("group relative flex flex-col gap-2", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        ) : (
          <div
            className="grid size-full place-items-center text-muted-foreground"
            aria-hidden
          >
            <ImageOff className="size-8" />
          </div>
        )}

        {status ? (
          <div className="absolute top-3 left-3">
            <ListingStatusBadge status={status} />
          </div>
        ) : null}

        {typeLabel && !status ? (
          <span className="absolute top-3 left-3 rounded-pill bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {typeLabel}
          </span>
        ) : null}

        {favoriteSlot ? (
          <div className="absolute top-3 right-3">{favoriteSlot}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
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

        {actionsSlot ? (
          <div className="relative z-10 mt-2 flex flex-wrap gap-2">{actionsSlot}</div>
        ) : null}
      </div>
    </article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      <div className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded-sm bg-muted" />
      <div className="h-4 w-1/3 animate-pulse rounded-sm bg-muted" />
    </div>
  );
}