import * as z from "zod";

export const transactionActionSchema = z
  .object({
    status: z.enum(["propose", "accept", "cancel", "complete"]),
    cancelReason: z.string().trim().max(500).optional(),
  })
  .superRefine((value, context) => {
    if (value.status === "cancel" && !value.cancelReason) {
      context.addIssue({
        code: "custom",
        path: ["cancelReason"],
        message: "Informe o motivo do cancelamento.",
      });
    }
  });

export type TransactionActionInput = z.infer<typeof transactionActionSchema>;
