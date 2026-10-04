import * as z from "zod"

export const baseListingSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres"),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  campus_id: z.string().uuid("Selecione um campus válido"),
})

export const productDetailsSchema = z.object({
  condition: z.enum(["novo", "usado", "seminovo"]),
  brand: z.string().optional(),
})

export const serviceDetailsSchema = z.object({
  modality: z.enum(["presencial", "online", "flexivel"]),
  price_unit: z.enum(["hora", "projeto", "diaria", "mensalidade"]),
})

// Schema completo para a Action de Produto
export const createProductSchema = baseListingSchema.extend({
  type: z.literal("produto"),
  details: productDetailsSchema,
})

// Schema completo para a Action de Serviço
export const createServiceSchema = baseListingSchema.extend({
  type: z.literal("servico"),
  details: serviceDetailsSchema,
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>