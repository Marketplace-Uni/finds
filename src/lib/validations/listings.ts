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

// SPRINT 2: SCHEMAS

export const roommateDetailsSchema = z.object({
  intention: z.enum(["oferece_vaga", "procura_vaga"]),
  housing_type: z.enum(["apartamento", "casa", "kitnet"]),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  move_in_date: z.string().nonempty("Data de entrada é obrigatória"),
})

export const republicDetailsSchema = z.object({
  vacancies: z.coerce.number().min(1, "Deve ter pelo menos 1 vaga"),
  gender: z.enum(["masculino", "feminino", "misto"]),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  amenities: z.array(z.string()).min(1, "Adicione pelo menos uma comodidade (ex: internet, faxina)"),
})

export const createRoommateSchema = baseListingSchema.extend({
  type: z.literal("roommate"),
  details: roommateDetailsSchema,
})

export const createRepublicSchema = baseListingSchema.extend({
  type: z.literal("republica"),
  details: republicDetailsSchema,
})

export type CreateRoommateInput = z.infer<typeof createRoommateSchema>
export type CreateRepublicInput = z.infer<typeof createRepublicSchema>
export type CreateProductInput = z.infer<typeof createProductSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>