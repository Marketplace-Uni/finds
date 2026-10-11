import * as z from "zod";

export const reportSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(["golpe", "conteudo_improprio", "anuncio_falso", "spam", "outro"]),
  description: z.string().trim().max(1000).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
