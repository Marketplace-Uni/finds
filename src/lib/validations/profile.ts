import { z } from "zod";

export const completarPerfilSchema = z.object({
  campusId: z.string().uuid("Selecione um campus válido"),
  next: z.string().optional(),
});

export type CompletarPerfilInput = z.infer<typeof completarPerfilSchema>;

export const editarPerfilSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(80, "O nome deve ter no máximo 80 caracteres"),
  bio: z
    .string()
    .trim()
    .max(280, "A bio deve ter no máximo 280 caracteres")
    .optional()
    .or(z.literal("")),
  campusId: z.string().uuid("Selecione um campus válido"),
});

export type EditarPerfilInput = z.infer<typeof editarPerfilSchema>;

export const convivenciaSchema = z.object({
  sou: z.array(z.string()).default([]),
  procuro: z.array(z.string()).default([]),
});

export type ConvivenciaInput = z.infer<typeof convivenciaSchema>;
