"use client";

import { ZecaCarrossel } from "@/src/components/ui/zeca-carrossel";
import { cn } from "@/src/lib/utils";

/**
 * Aviso de carregamento para ações que não trocam de página (ex.: salvar um
 * formulário com Server Action) — diferente de `loading.tsx`, que já cobre a
 * navegação entre rotas. Mesmo mascote do `LoadingState`, num cartão central
 * discreto sobre um fundo semitransparente (mesmo padrão de `dialog.tsx`).
 */
export function PendingOverlay({
  visible,
  label = "Salvando...",
  className,
}: {
  visible: boolean;
  label?: string;
  className?: string;
}) {
  if (!visible) return null;

  return (
    <div
      className={cn("fixed inset-0 z-50 grid place-items-center bg-foreground/20", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-2 rounded-lg border bg-card px-6 py-5 text-center shadow-lg">
        <ZecaCarrossel
          poses={[1, 7]}
          duracaoS={4}
          boxClassName="h-12 w-12"
          zecaClassName="h-12 w-auto text-primary"
        />
        <p className="text-sm font-medium text-foreground">{label}</p>
      </div>
    </div>
  );
}
