import type { ReactNode } from "react";
import { CircleCheck, CircleDashed, CircleX, Handshake } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format";

/** Estados da negociação, como em ARQUITETURA.md. */
export type NegotiationStatus = "pending" | "confirmed" | "completed" | "cancelled";

const ESTADOS: Record<
  NegotiationStatus,
  { label: string; descricao: string; Icone: typeof Handshake; classe: string }
> = {
  pending: {
    label: "Negociação proposta",
    descricao: "Esperando a outra pessoa aceitar.",
    Icone: CircleDashed,
    classe: "bg-muted text-foreground",
  },
  confirmed: {
    label: "Negociação aceita",
    descricao: "Combinem a entrega. Quando terminar, cada um marca como concluído.",
    Icone: Handshake,
    classe: "bg-secondary text-secondary-foreground",
  },
  completed: {
    label: "Negócio concluído",
    descricao: "Os dois confirmaram. Que tal avaliar a pessoa?",
    Icone: CircleCheck,
    classe: "bg-muted text-foreground",
  },
  cancelled: {
    label: "Negociação cancelada",
    descricao: "",
    Icone: CircleX,
    classe: "border-2 border-destructive/40 bg-background text-foreground",
  },
};

export type NegotiationCardProps = {
  status: NegotiationStatus;
  /** Valor combinado, quando houver. */
  price?: number | null;
  /** Motivo obrigatório do cancelamento. */
  cancelReason?: string | null;
  /** Quem já marcou como concluído, em `completed` parcial. */
  waitingOther?: boolean;
  /** Botões da etapa: aceitar, recusar, concluir, cancelar, avaliar. */
  actionsSlot?: ReactNode;
  className?: string;
};

/**
 * Card de status da negociação, que aparece no topo do chat (`headerSlot` do
 * `ChatPanel`). Mostra em que pé está o combinado e o que fazer agora.
 *
 * Não existe tela para isso no Figma: foi composto com os tokens da marca,
 * uma cor por etapa, seguindo o padrão dos chips (ver docs/DESIGN.md).
 *
 * É visual: as ações entram por slot, e quem é dono da rota cuida das
 * server actions.
 */
export function NegotiationCard({
  status,
  price,
  cancelReason,
  waitingOther = false,
  actionsSlot,
  className,
}: NegotiationCardProps) {
  const { label, descricao, Icone, classe } = ESTADOS[status];

  return (
    <section
      className={cn("flex flex-col gap-3 rounded-lg p-4", classe, className)}
      aria-label="Status da negociação"
    >
      <div className="flex items-start gap-3">
        <Icone className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-bold">{label}</p>

          {typeof price === "number" ? (
            <p className="text-sm font-medium">{formatPrice(price)}</p>
          ) : null}

          {status === "cancelled" && cancelReason ? (
            <p className="mt-1 text-sm opacity-90">{`Motivo: ${cancelReason}`}</p>
          ) : descricao ? (
            <p className="mt-1 text-sm opacity-90">{descricao}</p>
          ) : null}

          {waitingOther ? (
            <p className="mt-1 text-sm opacity-90">
              Você já marcou como concluído — falta a outra pessoa.
            </p>
          ) : null}
        </div>
      </div>

      {actionsSlot ? <div className="flex flex-wrap gap-2">{actionsSlot}</div> : null}
    </section>
  );
}
