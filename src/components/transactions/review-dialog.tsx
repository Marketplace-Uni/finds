import { Star } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { createReviewAction } from "@/src/app/actions/reviews";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { RatingInput } from "@/src/components/ui/modal";

export function ReviewDialog({
  transactionId,
  reviewedName,
}: {
  transactionId: string;
  reviewedName: string;
}) {
  return (
    <Dialog>
      <DialogPrimitive.Trigger asChild>
        <Button className="rounded-pill">
          <Star aria-hidden />
          Avaliar negociação
        </Button>
      </DialogPrimitive.Trigger>
      <DialogContent className="rounded-lg bg-background sm:max-w-md">
        <form action={createReviewAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">
              Avaliar negociação
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Como foi negociar com {reviewedName}? Sua avaliação ficará visível no perfil.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="transaction_id" value={transactionId} />
          <RatingInput name="rating" />
          <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
            Comentário (opcional)
            <textarea
              name="comment"
              maxLength={500}
              rows={3}
              className="resize-y rounded-md border border-border bg-background px-3 py-2 text-sm font-normal text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              placeholder="Conte como foi a experiência."
            />
          </label>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="submit" className="rounded-pill">
              Enviar avaliação
            </Button>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="ghost" className="rounded-pill text-muted-foreground">
                Voltar
              </Button>
            </DialogPrimitive.Close>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
