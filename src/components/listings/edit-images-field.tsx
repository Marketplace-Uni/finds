"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/src/lib/utils";

type FotoExistente = { kind: "existing"; path: string; url: string };
type FotoNova = { kind: "new"; file: File; url: string };
type Foto = FotoExistente | FotoNova;

type EditImagesFieldProps = {
  /** Fotos já salvas do anúncio, na ordem atual (a primeira é a capa). */
  initialImages: { path: string; url: string }[];
  /** Nome do campo de arquivo novo — o mesmo que a action espera em `uploadImages`. */
  name?: string;
  /** Nome do campo oculto com os caminhos das fotos existentes mantidas. */
  existingFieldName?: string;
  /** Limite total de fotos (existentes mantidas + novas). */
  max?: number;
  label?: string;
  className?: string;
};

/**
 * Seletor de fotos para a tela de edição: mistura fotos já salvas (vindas do
 * Storage, identificadas pelo `path`) com fotos recém-escolhidas (`File`),
 * na mesma grade, com o mesmo botão de remover para as duas.
 *
 * Fotos existentes removidas saem de cena só porque o `<input type="hidden">`
 * delas deixa de ser enviado — a action (`updateListing`) decide o que
 * realmente apagar comparando contra o que está salvo no banco, não confia
 * só no que chega daqui.
 *
 * Fotos novas usam o mesmo truque do `PhotoPicker` para manter um
 * `<input type="file">` de verdade sincronizado via `DataTransfer`.
 */
export function EditImagesField({
  initialImages,
  name = "images",
  existingFieldName = "existing_image_paths",
  max = 6,
  label = "Fotos do anúncio",
  className,
}: EditImagesFieldProps) {
  const [fotos, setFotos] = useState<Foto[]>(
    initialImages.map((image) => ({ kind: "existing", ...image })),
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      for (const foto of fotos) {
        if (foto.kind === "new") URL.revokeObjectURL(foto.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sincronizarInput(lista: Foto[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    for (const foto of lista) {
      if (foto.kind === "new") dt.items.add(foto.file);
    }
    inputRef.current.files = dt.files;
  }

  function adicionar(arquivos: FileList | null) {
    if (!arquivos) return;
    const novas: Foto[] = Array.from(arquivos)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ kind: "new", file, url: URL.createObjectURL(file) }));
    const lista = [...fotos, ...novas].slice(0, max);
    setFotos(lista);
    sincronizarInput(lista);
  }

  function remover(index: number) {
    const alvo = fotos[index];
    if (alvo?.kind === "new") URL.revokeObjectURL(alvo.url);
    const lista = fotos.filter((_, i) => i !== index);
    setFotos(lista);
    sincronizarInput(lista);
  }

  const cheio = fotos.length >= max;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="inline-flex w-fit rounded-md bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
        {label}
      </span>

      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {fotos.map((foto, index) => (
          <li key={foto.kind === "existing" ? foto.path : foto.url} className="relative">
            {foto.kind === "existing" ? (
              <input type="hidden" name={existingFieldName} value={foto.path} />
            ) : null}
            <div className="aspect-square overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.url} alt="" className="size-full object-cover" />
            </div>
            {index === 0 ? (
              <span className="absolute bottom-1 left-1 rounded-pill bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                capa
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => remover(index)}
              aria-label={`Remover foto ${index + 1}`}
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-pill bg-background/90 text-foreground hover:bg-primary/60 hover:text-primary-foreground"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </li>
        ))}

        {!cheio ? (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="grid aspect-square w-full place-items-center gap-1 rounded-md bg-muted text-muted-foreground hover:bg-primary/60 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ImagePlus className="size-6" aria-hidden />
              <span className="text-xs font-medium">Adicionar</span>
            </button>
          </li>
        ) : null}
      </ul>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(event) => adicionar(event.target.files)}
      />

      <p className="px-1 text-xs text-muted-foreground">
        Até {max} fotos. A primeira é a capa do anúncio.
      </p>
    </div>
  );
}
