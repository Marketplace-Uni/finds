import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

/**
 * Casca dos botões de ícone que ficam **sobre uma imagem** — favoritar no card
 * e no detalhe, por exemplo.
 *
 * O círculo claro sólido existe porque, sem ele, o ícone sumia em cima de
 * fotos claras (apontado pela Lia em 01/10). Quem monta o botão passa o
 * comportamento; aqui mora só o visual.
 */
export function OverlayIconButton({
  children,
  className,
  ...props
}: { children: ReactNode } & React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-9 place-items-center rounded-pill bg-background text-foreground shadow-sm",
        "transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "[&_svg]:size-4.5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
