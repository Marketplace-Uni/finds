"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";

import { cn } from "@/src/lib/utils";

type PhotoPickerProps = {
  /** Nome do campo no formulário. */
  name?: string;
  /** Limite de fotos; a primeira é a capa. */
  max?: number;
  label?: string;
  className?: string;
};

type Foto = { file: File; url: string };

/**
 * Seletor de fotos do anúncio. Precisa ser client component porque mostra a
 * prévia antes do envio — é a única parte do wizard que não é servidor.
 *
 * Mantém um `<input type="file">` de verdade com os arquivos escolhidos, então
 * o formulário envia normalmente; a server action do dono da rota recebe os
 * arquivos em `formData.getAll(name)`.
 */
export function PhotoPicker({
  name = "fotos",
  max = 6,
  label = "Fotos do anúncio",
  className,
}: PhotoPickerProps) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // As URLs de prévia seguram memória até serem revogadas.
  useEffect(() => {
    return () => {
      for (const foto of fotos) URL.revokeObjectURL(foto.url);
    };
  }, [fotos]);

  /** Reescreve o input com a lista atual, para o formulário enviar o certo. */
  function sincronizarInput(lista: Foto[]) {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    for (const foto of lista) dt.items.add(foto.file);
    inputRef.current.files = dt.files;
  }

  function adicionar(arquivos: FileList | null) {
    if (!arquivos) return;
    const novas = Array.from(arquivos)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    const lista = [...fotos, ...novas].slice(0, max);
    setFotos(lista);
    sincronizarInput(lista);
  }

  function remover(index: number) {
    const alvo = fotos[index];
    if (alvo) URL.revokeObjectURL(alvo.url);
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
          <li key={foto.url} className="relative">
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
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-pill bg-background/90 text-foreground hover:bg-background"
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
              className="grid aspect-square w-full place-items-center gap-1 rounded-md bg-muted text-muted-foreground hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
