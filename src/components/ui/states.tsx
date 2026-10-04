import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import { Zeca, type ZecaPose } from "@/src/components/ui/zeca";

type StateProps = {
  title: string;
  description?: string;
  /** Botão ou link de saída, quando houver. */
  action?: ReactNode;
  /** Qual pose do Zeca aparece. Ver /preview-visual para escolher. */
  pose?: ZecaPose;
  className?: string;
};

/**
 * Estado vazio padrão: use em toda tela com dados que pode não ter nenhum.
 * O texto fica em pt-BR e deve dizer o que a pessoa pode fazer.
 */
export function EmptyState({
  title,
  description,
  action,
  pose = 3,
  className,
}: StateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-lg bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <Zeca pose={pose} className="h-28 w-auto text-primary" />
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
  pose = 6,
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
      <Zeca pose={pose} className="h-28 w-auto text-destructive" />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
