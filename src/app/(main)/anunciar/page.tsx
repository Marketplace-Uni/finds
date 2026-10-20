import Link from "next/link"

import { requireCompleteProfile } from "@/src/lib/auth"
import { TIPOS_ANUNCIO, CLASSES_POR_TOKEN } from "@/src/components/listings/tipos-anuncio"

export default async function AnunciarPage() {
  await requireCompleteProfile("/anunciar")

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-3xl font-bold text-foreground">O que você quer anunciar?</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {TIPOS_ANUNCIO.map(({ slug, titulo, texto, Icone, token }) => (
          <Link
            key={slug}
            href={`/anunciar/${slug}`}
            className={`group flex flex-col gap-3 rounded-xl p-6 transition-all duration-200 hover:scale-105 hover:shadow-lg ${CLASSES_POR_TOKEN[token]}`}
          >
            <Icone className="size-8 transition-transform duration-200 group-hover:scale-110" aria-hidden />
            <h2 className="text-xl font-semibold">{titulo}</h2>
            <p className="text-sm opacity-90">{texto}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
