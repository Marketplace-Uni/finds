import { Flag } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { createReportAction } from "@/src/app/actions/reports";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { ReasonOptions } from "@/src/components/ui/modal";

const REPORT_REASONS = [
  { value: "golpe", label: "Parece golpe" },
  { value: "conteudo_improprio", label: "Conteúdo impróprio" },
  { value: "anuncio_falso", label: "Anúncio falso" },
  { value: "spam", label: "Spam" },
  { value: "outro", label: "Outro" },
];

export function ReportButton({ listingId }: { listingId: string }) {
  return (
    <Dialog>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" className="rounded-pill">
          <Flag aria-hidden />
          Denunciar anúncio
        </Button>
      </DialogPrimitive.Trigger>
      <DialogContent className="rounded-lg bg-background sm:max-w-md">
        <form action={createReportAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Denunciar anúncio
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              A denúncia é anônima. Selecione o motivo e, se quiser, conte mais detalhes.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="listing_id" value={listingId} />
          <ReasonOptions name="reason" options={REPORT_REASONS} />
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Detalhes (opcional)
            <textarea
              name="description"
              maxLength={1000}
              rows={3}
              className="resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              placeholder="Conte o que aconteceu."
            />
          </label>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="submit"
              className="rounded-pill bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Enviar denúncia
            </Button>
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="ghost"
                className="rounded-pill text-muted-foreground"
              >
                Voltar
              </Button>
            </DialogPrimitive.Close>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
