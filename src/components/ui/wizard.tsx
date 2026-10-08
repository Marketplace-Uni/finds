import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

/** Barra "quanto falta" do Figma. */
export function WizardProgress({ step, totalSteps }: { step: number; totalSteps: number }) {
  const atual = Math.min(Math.max(step, 1), totalSteps);
  const pct = Math.round((atual / totalSteps) * 100);
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-1.5 w-full overflow-hidden rounded-pill bg-muted"
        role="progressbar"
        aria-valuenow={atual}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Passo ${atual} de ${totalSteps}`}
      >
        <div className="h-full rounded-pill bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Passo {atual} de {totalSteps}
      </p>
    </div>
  );
}

type WizardShellProps = {
  title: string;
  subtitle?: string;
  step: number;
  totalSteps: number;
  /** Para onde o botão de voltar aponta. */
  backHref?: string;
  /** Server action ou rota do formulário. */
  action?: React.ComponentProps<"form">["action"];
  submitLabel?: string;
  /** Ex.: "Salvar rascunho", ao lado do botão principal. */
  secondaryAction?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Casca dos formulários em passos: anunciar, completar perfil, onboarding.
 *
 * No Figma cada passo é uma tela mobile inteira; no desktop vira um cartão
 * centralizado de ~720px, com a barra de progresso e o botão "Próximo"
 * (ver docs/DESIGN.md). O conteúdo de cada passo entra por `children`.
 */
export function WizardShell({
  title,
  subtitle,
  step,
  totalSteps,
  backHref,
  action,
  submitLabel = "Próximo",
  secondaryAction,
  children,
  className,
}: WizardShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-[720px]", className)}>
      <form action={action} className="flex flex-col gap-10">
        <header className="relative flex flex-col items-center gap-1 pt-2">
          {backHref ? (
            <Link
              href={backHref}
              className="absolute top-0 left-0 grid size-9 place-items-center rounded-pill text-foreground hover:bg-muted"
              aria-label="Voltar"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </Link>
          ) : null}
          <h1 className="text-center text-xl font-semibold text-foreground">{title}</h1>
          {subtitle ? (
            <p className="text-center text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </header>

        <div className="flex flex-col gap-7">{children}</div>

        <WizardProgress step={step} totalSteps={totalSteps} />

        <footer className="flex flex-col items-center gap-2">
          <Button type="submit" className="w-full max-w-[280px] rounded-pill py-6 font-bold">
            {submitLabel}
          </Button>
          {secondaryAction}
        </footer>
      </form>
    </div>
  );
}
