"use client";

import { Dialog as DialogPrimitive } from "radix-ui";

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

/**
 * Botão que abre um modal de confirmação antes de submeter uma Server
 * Action — pra ações que não dá pra desfazer fácil (encerrar/excluir um
 * anúncio, por exemplo). O botão visível só abre o modal; quem de fato
 * aciona a `action` é o `<form>` de dentro, no botão "Confirmar".
 */
export function ConfirmActionButton({
  action,
  label,
  title,
  description,
  confirmLabel = "Confirmar",
  destructive = false,
  className,
}: {
  /** Server Action já com os argumentos fixados via `.bind(null, ...)`. */
  action: (formData: FormData) => void | Promise<void>;
  label: string;
  title: string;
  description: string;
  confirmLabel?: string;
  /** Deixa o botão de confirmar vermelho — pra exclusão, por exemplo. */
  destructive?: boolean;
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={className}>
          {label}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form action={action}>
          <DialogFooter className="flex-row justify-end gap-2">
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" className="rounded-pill text-muted-foreground">
                Cancelar
              </Button>
            </DialogPrimitive.Close>
            <Button
              type="submit"
              className={cn(
                "rounded-pill",
                destructive && "bg-destructive text-white hover:bg-destructive/90",
              )}
            >
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
