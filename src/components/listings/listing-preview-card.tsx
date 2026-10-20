import { ImageOff } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { TIPOS_ANUNCIO, CLASSES_POR_TOKEN } from "@/src/components/listings/tipos-anuncio";
import type { ListingType } from "@/src/lib/listing-details";

export type ListingPreviewProps = {
  type: ListingType;
  title: string;
  description: string;
  /** Já formatado por quem chama (`formatPrice`, ou a faixa "R$ X – R$ Y"). */
  priceLabel?: string | null;
  campusLabel?: string | null;
  /** Chips com hashtag, como no detalhe real ("#eletrônicos"). */
  categories?: string[];
  /** Chips simples, como no detalhe real ("usado"). */
  attributes?: string[];
  /** Pares rótulo/valor, como no detalhe real (ex. "modalidade: online"). */
  specs?: { label: string; value: string }[];
  photoUrl?: string | null;
  className?: string;
};

/**
 * Mesmas cores/chips/tipografia do `ListingCard`/`ListingDetail` de verdade,
 * só que montado a partir do estado do formulário em vez de um anúncio salvo
 * — pra mostrar, enquanto a pessoa preenche `/anunciar`, como a página do
 * anúncio vai ficar.
 */
export function ListingPreviewCard({
  type,
  title,
  description,
  priceLabel,
  campusLabel,
  categories = [],
  attributes = [],
  specs = [],
  photoUrl,
  className,
}: ListingPreviewProps) {
  const tipo = TIPOS_ANUNCIO.find((item) => item.type === type);

  return (
    <aside
      className={cn("flex flex-col gap-4 rounded-xl bg-card p-5", className)}
      aria-label="Pré-visualização do anúncio"
    >
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Prévia do anúncio
      </p>

      <div className="aspect-square overflow-hidden rounded-lg bg-muted">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground" aria-hidden>
            <ImageOff className="size-8" />
          </div>
        )}
      </div>

      {tipo ? (
        <span
          className={cn(
            "w-fit rounded-pill px-2.5 py-0.5 text-xs font-semibold",
            CLASSES_POR_TOKEN[tipo.token],
          )}
        >
          {tipo.tituloSingular}
        </span>
      ) : null}

      <h3 className="line-clamp-2 text-lg font-bold text-foreground">
        {title || "Título do anúncio"}
      </h3>

      {priceLabel ? <p className="text-xl font-bold text-foreground">{priceLabel}</p> : null}

      {categories.length > 0 || attributes.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {categories.map((categoria) => (
            <span
              key={categoria}
              className="rounded-pill bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
            >{`#${categoria}`}</span>
          ))}
          {attributes.map((atributo) => (
            <span
              key={atributo}
              className="rounded-pill bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
            >
              {atributo}
            </span>
          ))}
        </div>
      ) : null}

      {specs.length > 0 ? (
        <dl className="flex flex-wrap gap-2">
          {specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-baseline gap-1.5 rounded-md bg-background px-3 py-1.5 text-xs"
            >
              <dt className="text-primary">{`${spec.label.toLowerCase()}:`}</dt>
              <dd className="font-medium text-foreground">{spec.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <p className="line-clamp-3 text-sm text-foreground/80">
        {description || "A descrição do anúncio aparece aqui."}
      </p>

      {campusLabel ? <p className="text-xs text-primary">{campusLabel}</p> : null}
    </aside>
  );
}
