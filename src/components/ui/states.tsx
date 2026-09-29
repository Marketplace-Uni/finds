import type { ReactNode } from "react";
import { SearchX, TriangleAlert } from "lucide-react";

import { cn } from "@/src/lib/utils";

type StateProps = {
  title: string;
  description?: string;
  /** Botão ou link de saída, quando houver. */
  action?: ReactNode;
  className?: string;
};

/**
 * Estado vazio padrão: use em toda tela com dados que pode não ter nenhum.
 * O texto fica em pt-BR e deve dizer o que a pessoa pode fazer.
 */
export function EmptyState({ title, description, action, className }: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <SearchX className="size-8 text-muted-foreground" aria-hidden />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

/** Estado de erro padrão, para quando a busca de dados falha. */
export function ErrorState({
  title = "Não conseguimos carregar isso",
  description = "Tente de novo em instantes.",
  action,
  className,
}: Partial<StateProps>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg border-2 border-destructive/30 px-6 py-14 text-center",
        className,
      )}
      role="alert"
    >
      <TriangleAlert className="size-8 text-destructive" aria-hidden />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
