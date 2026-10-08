import type { ReactNode } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  ListingGallery,
  type ListingImage,
} from "@/src/components/listings/listing-gallery";
import { formatPrice } from "@/src/lib/format";
import { cn } from "@/src/lib/utils";

export type ListingSeller = {
  name: string;
  username: string;
  avatarUrl?: string | null;
  /** Já formatado pelo `formatLastSeen()` do Kaike: "ativo há 2h". */
  lastSeen?: string | null;
};

export type ListingDetailProps = {
  title: string;
  price?: number | null;
  /** "por hora", "por mês". */
  priceNote?: string | null;
  description: string;
  images: ListingImage[];
  /** Chips com hashtag, como no Figma: "eletrodomésticos", "tecnologia". */
  categories?: string[];
  /** Características: "usado", "detalhes de uso". */
  attributes?: string[];
  /** Campos específicos do tipo do anúncio (os `details` do Josué). */
  specs?: { label: string; value: string }[];
  seller: ListingSeller;
  /** `<StartChatButton>` do Alexandre — o CTA principal. */
  chatSlot?: ReactNode;
  /** `<FavoriteButton>` do Alexandre. */
  favoriteSlot?: ReactNode;
  /** `<ReportButton>` do Alexandre. */
  reportSlot?: ReactNode;
  /**
   * Botão "Seguir" do card do anunciante. Está no Figma e a Lia confirmou em
   * 07/10 que fica no layout — mas seguir usuários não está no ESCOPO.md, então
   * a implementação vem de fora por slot.
   */
  followSlot?: ReactNode;
  /** Grid de anúncios do mesmo anunciante. */
  relatedSlot?: ReactNode;
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
 * As tags alternam entre as cores da paleta, como os chips de categoria do
 * feed no Figma — a Lia pediu que não ficassem todas iguais, porque as cores
 * têm peso parecido na marca.
 */
const TONS_DE_CHIP = [
  "bg-secondary text-secondary-foreground",
  "bg-accent text-accent-foreground",
  "bg-nav text-nav-foreground",
  "border-2 border-primary text-primary",
] as const;

function Chip({ children, index = 0 }: { children: ReactNode; index?: number }) {
  return (
    <span
      className={cn(
        "rounded-pill px-3 py-1 text-xs font-semibold",
        TONS_DE_CHIP[index % TONS_DE_CHIP.length],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Detalhe do anúncio. No Figma é um scroll vertical no mobile; no desktop a
 * galeria vai para a esquerda e título, preço, chips, anunciante e CTA para a
 * coluna da direita, que acompanha o scroll (ver docs/DESIGN.md).
 *
 * É visual: recebe tudo por props e não acessa o banco. Os componentes de
 * chat, favorito e denúncia entram pelos slots.
 */
export function ListingDetail({
  title,
  price,
  priceNote,
  description,
  images,
  categories = [],
  attributes = [],
  specs = [],
  seller,
  chatSlot,
  favoriteSlot,
  reportSlot,
  followSlot,
  relatedSlot,
}: ListingDetailProps) {
  return (
    <article className="flex flex-col gap-12">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <ListingGallery images={images} />

        <div className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
          <header className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {favoriteSlot}
          </header>

          {typeof price === "number" ? (
            <p className="text-2xl font-bold text-foreground">
              {formatPrice(price)}
              {priceNote ? (
                <span className="text-base font-normal text-muted-foreground">
                  {" "}
                  {priceNote}
                </span>
              ) : null}
            </p>
          ) : null}

          {categories.length > 0 ? (
            <section>
              <h2 className="mb-2 text-sm font-medium text-foreground">Categorias</h2>
              <div className="flex flex-wrap gap-2">
                {categories.map((categoria, i) => (
                  <Chip key={categoria} index={i}>
                    {`#${categoria}`}
                  </Chip>
                ))}
              </div>
            </section>
          ) : null}

          {attributes.length > 0 ? (
            <section>
              <h2 className="mb-2 text-sm font-medium text-foreground">
                Características
              </h2>
              <div className="flex flex-wrap gap-2">
                {/* Começa num tom diferente das categorias, para os dois blocos
                    não ficarem iguais. */}
                {attributes.map((atributo, i) => (
                  <Chip key={atributo} index={i + 1}>
                    {atributo}
                  </Chip>
                ))}
              </div>
            </section>
          ) : null}

          {/* A Lia preferiu tags no lugar da lista rótulo/valor. */}
          {specs.length > 0 ? (
            <dl className="flex flex-wrap gap-2">
              {specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-baseline gap-1.5 rounded-md bg-card px-3 py-1.5 text-xs"
                >
                  <dt className="text-primary">{`${spec.label.toLowerCase()}:`}</dt>
                  <dd className="font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <section className="flex items-center gap-3 border-t border-border pt-5">
            <Avatar className="size-14 border-2 border-secondary">
              <AvatarImage src={seller.avatarUrl ?? undefined} alt="" />
              <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                {initials(seller.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link
                href={`/perfil/${seller.username}`}
                className="block truncate font-bold text-foreground hover:underline"
              >
                {seller.name}
              </Link>
              {seller.lastSeen ? (
                <p className="text-sm text-muted-foreground">{seller.lastSeen}</p>
              ) : null}
            </div>
            {followSlot ? <div className="ml-auto shrink-0">{followSlot}</div> : null}
          </section>

          {chatSlot}

          <section>
            <h2 className="mb-2 text-sm font-medium text-foreground">Descrição</h2>
            <p className="text-sm whitespace-pre-line text-foreground">{description}</p>
          </section>

          {/* Caixa bege em volta: sem ela o botão de denúncia sumia no fundo. */}
          {reportSlot ? (
            <div className="rounded-lg bg-card p-2 text-center text-primary">
              {reportSlot}
            </div>
          ) : null}
        </div>
      </div>

      <section className="flex items-start gap-4 rounded-lg bg-card p-6">
        <TriangleAlert className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden />
        <div>
          <h2 className="font-bold text-primary">Não caia em golpes!</h2>
          <p className="mt-1 text-sm text-foreground">
            Combine a entrega em um lugar movimentado do campus e veja o item pessoalmente
            antes de pagar. Desconfie de preço muito abaixo do normal e de quem pede
            pagamento adiantado ou quer levar a conversa para fora do Finds.
          </p>
        </div>
      </section>

      {relatedSlot ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-foreground">Do mesmo anunciante</h2>
          {relatedSlot}
        </section>
      ) : null}
    </article>
  );
}
