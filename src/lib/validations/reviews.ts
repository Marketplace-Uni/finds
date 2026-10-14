import * as z from "zod";

export const reviewSchema = z.object({
  transactionId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
