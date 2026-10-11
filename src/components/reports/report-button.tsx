import { Flag } from "lucide-react";

import { createReportAction } from "@/src/app/actions/reports";
import { Button } from "@/src/components/ui/button";
import { Modal, ReasonOptions } from "@/src/components/ui/modal";

const REPORT_REASONS = [
  { value: "golpe", label: "Parece golpe" },
  { value: "conteudo_improprio", label: "Conteúdo impróprio" },
  { value: "anuncio_falso", label: "Anúncio falso" },
  { value: "spam", label: "Spam" },
  { value: "outro", label: "Outro" },
];

export function ReportButton({ listingId }: { listingId: string }) {
  return (
    <Modal
      trigger={
        <Button variant="ghost" className="rounded-pill">
          <Flag aria-hidden />
          Denunciar anúncio
        </Button>
      }
      title="Denunciar anúncio"
      description="A denúncia é anônima. Selecione o motivo e, se quiser, conte mais detalhes."
      confirmLabel="Enviar denúncia"
      destructive
      action={createReportAction}
    >
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
    </Modal>
  );
}
