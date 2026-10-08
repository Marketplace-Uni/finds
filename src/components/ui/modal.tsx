"use client";

import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

type ModalProps = {
  /** O que abre o modal. */
  trigger: ReactNode;
  title: string;
  description?: string;
  children?: ReactNode;
  /** Rótulo do botão principal. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ações destrutivas (cancelar negociação, excluir) ficam em vermelho. */
  destructive?: boolean;
  /** Server action do formulário. O modal já envolve o conteúdo num <form>. */
  action?: React.ComponentProps<"form">["action"];
  className?: string;
};

/**
 * Modal padrão do Finds — a casca usada em denúncia, avaliação, cancelamento e
 * confirmações. Não existe no Figma; segue os tokens da marca e o mesmo
 * vocabulário dos botões em pílula (ver docs/DESIGN.md).
 *
 * O conteúdo já vem dentro de um `<form>`, então basta passar a server action
 * e colocar os campos em `children`.
 */
export function Modal({
  trigger,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Voltar",
  destructive = false,
  action,
  className,
}: ModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className={cn("rounded-lg bg-background sm:max-w-md", className)}>
        <form action={action} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              {title}
            </DialogTitle>
            {description ? (
              <DialogDescription className="text-muted-foreground">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          {children}

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="submit"
              className={cn(
                "rounded-pill",
                destructive &&
                  "bg-destructive text-destructive-foreground hover:bg-destructive/90",
              )}
            >
              {confirmLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-pill text-muted-foreground"
            >
              {cancelLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Lista de motivos em chips, para denúncia e cancelamento — onde o motivo é
 * obrigatório. Mesmo padrão de seleção dos filtros.
 */
export function ReasonOptions({
  name = "motivo",
  options,
}: {
  name?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <fieldset className="flex flex-wrap gap-2">
      <legend className="mb-2 text-sm font-medium text-foreground">Motivo</legend>
      {options.map((option) => {
        const id = `${name}-${option.value}`;
        return (
          <div key={option.value}>
            <input
              id={id}
              type="radio"
              name={name}
              value={option.value}
              required
              className="peer sr-only"
            />
            <label
              htmlFor={id}
              className={cn(
                "inline-flex cursor-pointer items-center rounded-pill px-3 py-1.5 text-sm font-semibold",
                "bg-muted text-foreground transition-colors hover:bg-primary/60 hover:text-primary-foreground",
                "peer-checked:bg-primary peer-checked:text-primary-foreground",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
              )}
            >
              {option.label}
            </label>
          </div>
        );
      })}
    </fieldset>
  );
}

/**
 * Nota de 1 a 5 estrelas, para o modal de avaliação. São radios de verdade,
 * então o formulário envia sem JavaScript e funciona pelo teclado.
 */
export function RatingInput({ name = "nota" }: { name?: string }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-foreground">Sua nota</legend>
      {/* Ordem invertida no DOM: o `~` do CSS só alcança irmãos seguintes, então
          as estrelas à esquerda da escolhida é que acendem. */}
      <div className="flex flex-row-reverse justify-end gap-1">
        {[5, 4, 3, 2, 1].map((nota) => {
          const id = `${name}-${nota}`;
          return (
            <div key={nota} className="contents">
              <input
                id={id}
                type="radio"
                name={name}
                value={nota}
                required
                className="peer sr-only"
              />
              <label
                htmlFor={id}
                aria-label={nota === 1 ? "1 estrela" : `${nota} estrelas`}
                className={cn(
                  "cursor-pointer text-3xl leading-none text-muted-foreground transition-colors",
                  "peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                  "hover:text-primary",
                )}
              >
                ★
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
