"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

type CompleteProfileContextValue = {
  isComplete: boolean;
  openGate: () => void;
};

const CompleteProfileContext = createContext<CompleteProfileContextValue | null>(null);

/**
 * Envolve as telas logadas ((main)/layout.tsx) e guarda se o perfil da
 * pessoa está completo (hoje: `campus_id` preenchido). Quando uma ação
 * exigir perfil completo e ele não estiver, abre o modal em vez de navegar.
 */
export function CompleteProfileProvider({
  isComplete,
  children,
}: {
  isComplete: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <CompleteProfileContext.Provider value={{ isComplete, openGate: () => setOpen(true) }}>
      {children}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete seu perfil</DialogTitle>
            <DialogDescription>
              Escolha o seu campus para liberar essa ação. Leva menos de um minuto.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button asChild className="rounded-pill">
              <Link href={`/completar-perfil?next=${encodeURIComponent(pathname)}`}>
                Completar perfil
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CompleteProfileContext.Provider>
  );
}

/**
 * Hook para telas/ações que exigem perfil completo (favoritar, enviar
 * mensagem, anunciar, etc.). Se o perfil estiver incompleto, abre o modal
 * "Complete seu perfil" em vez de executar a ação.
 *
 * Precisa estar dentro de `<CompleteProfileProvider>` — já envolve todo o
 * layout `(main)`, então qualquer Client Component logado pode usar.
 */
export function useCompleteProfileGate() {
  const ctx = useContext(CompleteProfileContext);
  if (!ctx) {
    throw new Error(
      "useCompleteProfileGate precisa estar dentro de <CompleteProfileProvider> (ver src/app/(main)/layout.tsx).",
    );
  }

  const { isComplete, openGate } = ctx;

  function requireComplete(action: () => void) {
    if (isComplete) {
      action();
    } else {
      openGate();
    }
  }

  return { isComplete, requireComplete };
}
