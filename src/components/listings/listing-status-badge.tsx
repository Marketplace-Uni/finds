import { cn } from "@/src/lib/utils";

/** Estados do anúncio, como em ARQUITETURA.md. */
export type ListingStatus = "active" | "draft" | "paused" | "sold" | "closed";

const ESTADOS: Record<ListingStatus, { label: string; classe: string }> = {
  active: { label: "Ativo", classe: "bg-secondary text-secondary-foreground" },
  draft: { label: "Rascunho", classe: "bg-muted text-muted-foreground" },
  paused: { label: "Pausado", classe: "bg-accent text-accent-foreground" },
  sold: { label: "Vendido", classe: "bg-nav text-nav-foreground" },
  closed: { label: "Encerrado", classe: "bg-nav text-nav-foreground" },
};

/**
 * Selo do estado do anúncio, usado em "Meus anúncios" sobre a imagem do card.
 * Cada estado tem uma cor da paleta, para dar de bater o olho e entender.
 */
export function ListingStatusBadge({
  status,
  className,
}: {
  status: ListingStatus;
  className?: string;
}) {
  const { label, classe } = ESTADOS[status];
  return (
    <span
      className={cn(
        "rounded-pill px-2.5 py-0.5 text-xs font-semibold",
        classe,
        className,
      )}
    >
      {label}
    </span>
  );
}
