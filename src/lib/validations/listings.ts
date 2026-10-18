import * as z from "zod"

export const baseListingSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres"),
  description: z.string().min(20, "A descrição deve ter pelo menos 20 caracteres"),
  price: z.coerce.number().min(0, "O preço não pode ser negativo"),
  campus_id: z.string().uuid("Selecione um campus válido"),
})

export const productDetailsSchema = z.object({
  category: z.enum(["livros", "eletrônicos", "móveis", "eletrodomésticos", "roupas", "material de estudo", "outros"]).optional(),
  condition: z.enum(["novo", "seminovo", "usado"]),
  brand: z.string().optional(),
})

export const serviceDetailsSchema = z.object({
  category: z.enum(["aulas", "design", "programação", "fotografia", "reparos", "beleza", "outros"]).optional(),
  modality: z.enum(["presencial", "online", "flexivel"]),
  price_unit: z.enum(["hora", "projeto", "diaria", "mensalidade", "a combinar"]),
})

// Roommate/república usam faixa de preço (quem procura ou oferece vaga nem
// sempre tem um valor fechado) em vez do preço único de produto/serviço.
const priceRangeFields = {
  price_min: z.coerce.number().min(0, "O preço mínimo não pode ser negativo"),
  price_max: z.coerce.number().min(0, "O preço máximo não pode ser negativo"),
}

export const roommateDetailsSchema = z
  .object({
    mode: z.enum(["oferece_vaga", "procura_vaga"]),
    housing_type: z.enum(["apartamento", "casa"]),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    move_in_date: z.string().min(1, "Data de entrada é obrigatória"),
    gender_preference: z.enum(["qualquer", "feminino", "masculino"]),
    ...priceRangeFields,
  })
  .refine((data) => data.price_max >= data.price_min, {
    message: "O preço máximo deve ser maior ou igual ao mínimo",
    path: ["price_max"],
  })

export const republicDetailsSchema = z
  .object({
    vacancies: z.coerce.number().min(1, "Deve ter pelo menos 1 vaga"),
    gender: z.enum(["feminina", "masculina", "mista"]),
    neighborhood: z.string().min(2, "Bairro é obrigatório"),
    amenities: z.array(z.string()).min(1, "Adicione pelo menos uma comodidade"),
    ...priceRangeFields,
  })
  .refine((data) => data.price_max >= data.price_min, {
    message: "O preço máximo deve ser maior ou igual ao mínimo",
    path: ["price_max"],
  })

// Schema completo para a Action de Produto
export const createProductSchema = baseListingSchema.extend({
  type: z.literal("product"), // ❌ CORRIGIDO PARA INGLÊS
  details: productDetailsSchema,
})

// Schema completo para a Action de Serviço
export const createServiceSchema = baseListingSchema.extend({
  type: z.literal("service"), // ❌ CORRIGIDO PARA INGLÊS
  details: serviceDetailsSchema,
})

// Schema completo para a Action de Roommate
export const createRoommateSchema = baseListingSchema.extend({
  type: z.literal("roommate"), // ✅ ADICIONADO
  details: roommateDetailsSchema,
})

// Schema completo para a Action de República
export const createRepublicSchema = baseListingSchema.extend({
  type: z.literal("republic"), // ✅ ADICIONADO
  details: republicDetailsSchema,
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type CreateRoommateInput = z.infer<typeof createRoommateSchema>
export type CreateRepublicInput = z.infer<typeof createRepublicSchema>