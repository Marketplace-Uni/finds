import { ImageOff } from "lucide-react";

import { cn } from "@/src/lib/utils";

export type ListingImage = { url: string; alt?: string };

/**
 * Galeria do detalhe do anúncio. No Figma é um carrossel com bolinhas; aqui
 * é uma faixa com scroll-snap e miniaturas que funcionam como âncoras, então
 * não precisa de JavaScript nem de client component.
 *
 * `galleryId` só importa se houver mais de uma galeria na mesma página.
 */
export function ListingGallery({
  images,
  galleryId = "galeria",
  className,
}: {
  images: ListingImage[];
  galleryId?: string;
  className?: string;
}) {
  if (images.length === 0) {
    return (
      <div
        className={cn(
          "grid aspect-square place-items-center rounded-lg bg-muted text-muted-foreground",
          className,
        )}
      >
        <ImageOff className="size-10" aria-hidden />
        <span className="sr-only">Anúncio sem fotos</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg bg-muted">
        {images.map((image, index) => (
          <div
            key={image.url}
            id={`${galleryId}-${index}`}
            className="aspect-square w-full shrink-0 snap-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.url}
              alt={image.alt ?? ""}
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <ul className="flex flex-wrap gap-2">
          {images.map((image, index) => (
            <li key={image.url}>
              <a
                href={`#${galleryId}-${index}`}
                className="block size-16 overflow-hidden rounded-sm bg-muted ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Ver foto ${index + 1} de ${images.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="size-full object-cover" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
