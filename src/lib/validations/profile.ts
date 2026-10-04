import { z } from "zod";

export const completarPerfilSchema = z.object({
  campusId: z.string().uuid("Selecione um campus válido"),
  next: z.string().optional(),
});

export type CompletarPerfilInput = z.infer<typeof completarPerfilSchema>;
