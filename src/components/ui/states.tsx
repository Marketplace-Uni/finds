import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";
import { Zeca, type ZecaPose } from "@/src/components/ui/zeca";
import { LogoFinds } from "@/src/components/layout/logo-finds";

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
        "flex flex-col items-center gap-1.5 rounded-lg bg-card px-6 py-14 text-center",
        className,
      )}
    >
      <Zeca pose={pose} className="mb-1.5 h-28 w-auto text-primary" />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}

/**
 * Tela de carregamento, para `loading.tsx` (o Suspense fallback de cada
 * rota). Versão simples feita pelo Kaike porque o Caike ainda não desenhou
 * uma no Figma — ele refina depois, como já aconteceu com `ui/dialog.tsx`.
 */
export function LoadingState({
  description = "Carregando...",
  className,
}: {
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-20 text-center",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <LogoFinds className="h-10 w-auto animate-pulse text-primary" />
      <p className="text-sm text-muted-foreground">{description}</p>
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
        "flex flex-col items-center gap-1.5 rounded-lg border-2 border-destructive/30 px-6 py-14 text-center",
        className,
      )}
      role="alert"
    >
      <Zeca pose={pose} className="mb-1.5 h-28 w-auto text-destructive" />
      <p className="font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
