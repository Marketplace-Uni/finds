import Link from "next/link";

import { Zeca } from "@/src/components/ui/zeca";
import { cn } from "@/src/lib/utils";

/**
 * Faixa "Faça um anúncio!" do feed, como no frame `Menu App` do Figma: fundo
 * laranja, chamada curta e a legenda do mascote em Anonymous Pro.
 *
 * Usa a pose 4 do Zeca — a única horizontal, que é justamente a que cabe numa
 * faixa larga sem esticar o layout.
 *
 * É visual e não acessa o banco: quem é dono da rota só precisa renderizar.
 */
export function AnunciarBanner({ className }: { className?: string }) {
  return (
    <Link
      href="/anunciar"
      className={cn(
        "group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-primary px-6 py-5",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-semibold text-primary-foreground">
          Faça um anúncio!
        </span>
        <span className="font-mono text-xs text-primary-foreground/80">
          o Zeca vai te ajudar nessa...
        </span>
      </div>

      <Zeca
        pose={4}
        className="h-20 w-auto shrink-0 text-primary-foreground transition-transform group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
