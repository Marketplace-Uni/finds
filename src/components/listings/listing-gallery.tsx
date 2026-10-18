import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type ListingImage = { url: string; alt?: string };

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
            className="relative aspect-square w-full shrink-0 snap-center"
          >
            <Image
              src={image.url}
              alt={image.alt ?? "Foto do anúncio"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0} // A primeira imagem carrega logo
              className="object-cover"
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
                className="relative block size-16 overflow-hidden rounded-sm bg-muted ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-label={`Ver foto ${index + 1} de ${images.length}`}
              >
                <Image 
                  src={image.url} 
                  alt="" 
                  fill 
                  sizes="64px" 
                  className="object-cover" 
                />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}