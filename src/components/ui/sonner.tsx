"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Wrapper do Sonner com os tokens do tema do Finds. O app não tem alternância
 * de tema (claro/escuro) em `globals.css`, então fixamos `theme="light"` em
 * vez de deixar o Sonner seguir o esquema do sistema operacional, que geraria
 * um toast escuro sem token correspondente.
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-card! text-card-foreground! border-border! shadow-lg! rounded-lg!",
          title: "text-foreground!",
          description: "text-muted-foreground!",
          actionButton: "bg-primary! text-primary-foreground!",
          cancelButton: "bg-muted! text-muted-foreground!",
          error: "bg-destructive! text-destructive-foreground! border-destructive!",
          success: "bg-secondary! text-secondary-foreground! border-secondary!",
        },
      }}
      {...props}
    />
  );
}
