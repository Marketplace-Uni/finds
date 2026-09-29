import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import { ListingCardSkeleton } from "@/src/components/listings/listing-card";

/**
 * Grid do feed, da busca e dos favoritos: 4 colunas no desktop largo,
 * caindo até 1 coluna no celular (ver docs/DESIGN.md).
 */
export function ListingGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Grid de esqueletos para o carregamento. */
export function ListingGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ListingGrid>
      {Array.from({ length: count }, (_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </ListingGrid>
  );
}
