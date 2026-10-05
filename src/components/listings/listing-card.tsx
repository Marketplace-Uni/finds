import type { ReactNode } from "react";
import Link from "next/link";
import { ImageOff } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format";
import {
  ListingStatusBadge,
  type ListingStatus,
} from "@/src/components/listings/listing-status-badge";

export type ListingCardProps = {
  /** Rota do detalhe, normalmente `/anuncios/[id]`. */
  href: string;
  title: string;
  /** Em reais. `null` para anúncios sem preço (ex.: procura-se). */
  price?: number | null;
  /** Complemento do preço: "por hora", "por mês". */
  priceNote?: string | null;
  /** Cidade ou campus, como "Uberlândia, MG". */
  location?: string | null;
  imageUrl?: string | null;
  /** Chip do tipo do anúncio: "Serviço", "República"… */
  typeLabel?: string | null;
  /** Selo de estado, usado em "Meus anúncios": rascunho, pausado, vendido. */
  status?: ListingStatus | null;
  /**
   * Ações do dono do anúncio (editar, pausar, excluir). Fica acima do link que
   * cobre o card, então continua clicável.
   */
  actionsSlot?: ReactNode;
  /**
   * Onde o `<FavoriteButton>` do Alexandre entra. Fica sobreposto no canto
   * superior direito da imagem, como no Figma.
   */
  favoriteSlot?: ReactNode;
  className?: string;
};

/**
 * Card de anúncio — o componente-padrão do feed, da busca, dos favoritos e
 * dos relacionados. No Figma o card é horizontal (lista mobile); no desktop
 * vira vertical para entrar no grid de 3–4 colunas (ver docs/DESIGN.md).
 *
 * É visual: recebe tudo por props e não acessa o banco.
 */
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
}: ListingCardProps) {
  return (
    <article className={cn("group relative flex flex-col gap-2", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          /* next/image exige images.remotePatterns com o domínio do Supabase
             Storage; trocar quando o bucket estiver no next.config.ts. */
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

        {status ? (
          <div className="absolute top-2 left-2">
            <ListingStatusBadge status={status} />
          </div>
        ) : null}

        {typeLabel && !status ? (
          <span className="absolute top-2 left-2 rounded-pill bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
            {typeLabel}
          </span>
        ) : null}

        {favoriteSlot ? (
          <div className="absolute top-2 right-2">{favoriteSlot}</div>
        ) : null}
      </div>

      <div className="flex flex-col gap-0.5">
        {/* O link cobre o card todo, mas deixa o botão de favoritar clicável. */}
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

        {/* `relative z-10` tira as ações de baixo do link que cobre o card. */}
        {actionsSlot ? (
          <div className="relative z-10 mt-2 flex flex-wrap gap-2">{actionsSlot}</div>
        ) : null}
      </div>
    </article>
  );
}

/** Esqueleto com a mesma altura do card, para o carregamento do feed. */
export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden>
      <div className="aspect-[4/3] animate-pulse rounded-lg bg-muted" />
      <div className="h-4 w-4/5 animate-pulse rounded-sm bg-muted" />
      <div className="h-4 w-1/3 animate-pulse rounded-sm bg-muted" />
    </div>
  );
}
