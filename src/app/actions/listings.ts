"use server"

import { createClient } from "../../lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  createProductSchema,
  createServiceSchema,
  createRoommateSchema,
  createRepublicSchema,
} from "@/src/lib/validations/listings"
import type { ListingType } from "@/src/lib/listing-details"

// Only these count as "imagem" pro upload de anúncio — mesmo que o usuário
// troque a extensão do arquivo, o navegador só reporta um desses `type` pra
// formatos que ele reconhece de verdade como jpg/png.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"])
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png"])

export async function uploadImages(formData: FormData) {
  const supabase = await createClient()
  // Um <input type="file"> sem nada selecionado ainda manda um File vazio
  // (name: "", size: 0) no FormData — sem filtrar, toda submissão sem foto
  // tentava subir esse arquivo vazio e quebrava com "Erro no upload da
  // imagem" (achado testando o fluxo de /anunciar).
  const files = (formData.getAll("images") as File[]).filter((file) => file.size > 0)
  const uploadedUrls: string[] = []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  // Validação de formato no servidor: o `accept="image/*"` do input é só uma
  // dica pro seletor de arquivo do navegador, não impede nada — alguém pode
  // mandar qualquer arquivo direto pra Server Action. Só aceita JPG/JPEG/PNG.
  for (const file of files) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const tipoValido = ALLOWED_IMAGE_TYPES.has(file.type)
    const extensaoValida = ALLOWED_IMAGE_EXTENSIONS.has(ext)
    if (!tipoValido || !extensaoValida) {
      throw new Error(`Formato não suportado: "${file.name}". Envie apenas imagens JPG, JPEG ou PNG.`)
    }
  }

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    // A policy de Storage (ver migration 20261018180000) só libera escrita
    // dentro da pasta com o próprio id do usuário — o caminho precisa
    // começar exatamente por isso, não só conter o id em algum lugar.
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file)

    if (uploadError) throw new Error("Erro no upload da imagem: " + uploadError.message)

    // Guardar o caminho dentro do bucket (não a URL pública): quem lê
    // `listing_images.path` (src/lib/listings.ts) já chama `getPublicUrl()`
    // em cima dele. Salvar a URL pública aqui fazia esse `getPublicUrl()` ser
    // chamado duas vezes, gerando uma URL inválida — por isso a imagem nunca
    // aparecia no detalhe do anúncio, mesmo com o upload tendo funcionado.
    uploadedUrls.push(filePath)
  }

  return uploadedUrls
}

export async function createListing(
  data: {
    title: string;
    description: string;
    price: number;
    type: string;
    campus_id: string;
    details: Record<string, unknown>;
  },
  imageUrls: string[],
  status: 'active' | 'draft' = 'active' // <-- Adicione esta linha!
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Não autorizado")

  // 1. Inserir o anúncio principal (Corrigido para owner_id e retirado o campo images)
  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      owner_id: user.id, // CORREÇÃO 1: era user_id, virou owner_id
      title: data.title || "Rascunho sem título",
      description: data.description || "",
      price: data.price || 0,
      type: data.type,
      campus_id: data.campus_id,
      details: data.details || {},
      status: status, // 'active' ou 'draft' (CORREÇÃO 2)
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // 2. Inserir as imagens na tabela separada (Corrigido com o schema real da imagem)
  if (imageUrls && imageUrls.length > 0) {
    const imagesData = imageUrls.map((url, index) => ({
      listing_id: listing.id,
      path: url,        // A coluna no seu banco se chama 'path'
      position: index   // A coluna 'position' vai ditar a ordem (0 será a capa, 1 a segunda, etc)
    }))

    const { error: imageError } = await supabase
      .from('listing_images')
      .insert(imagesData)

    if (imageError) throw new Error("Anúncio criado, mas erro ao salvar imagens: " + imageError.message)
  }

  revalidatePath('/')
  revalidatePath('/meus-anuncios')
  redirect(status === 'draft' ? '/meus-anuncios' : `/anuncios/${listing.id}`)
}

// Nova Action para gerenciar Pausar, Encerrar e Ativar
export async function updateListingStatus(id: string, newStatus: 'active' | 'paused' | 'closed') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Não autorizado")

  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('owner_id', user.id) // CORREÇÃO: owner_id

  if (error) throw new Error("Erro ao atualizar status")

  revalidatePath('/meus-anuncios')
}

const SCHEMA_BY_TYPE = {
  product: createProductSchema,
  service: createServiceSchema,
  roommate: createRoommateSchema,
  republic: createRepublicSchema,
} as const

/** Lê os campos de `details` específicos do tipo direto do FormData do wizard. */
function detailsFromForm(type: ListingType, formData: FormData): Record<string, unknown> {
  switch (type) {
    case "product":
      return {
        category: formData.get("category") || undefined,
        condition: formData.get("condition") ?? "",
        brand: formData.get("brand") || undefined,
      }
    case "service":
      return {
        category: formData.get("category") || undefined,
        modality: formData.get("modality") ?? "",
        price_unit: formData.get("price_unit") ?? "",
      }
    case "roommate":
      return {
        mode: formData.get("mode") ?? "",
        housing_type: formData.get("housing_type") ?? "",
        neighborhood: formData.get("neighborhood") ?? "",
        move_in_date: formData.get("move_in_date") ?? "",
        gender_preference: formData.get("gender_preference") ?? "",
        price_min: formData.get("price_min") ?? "0",
        price_max: formData.get("price_max") ?? "0",
      }
    case "republic":
      return {
        vacancies: formData.get("vacancies") ?? "0",
        gender: formData.get("gender") ?? "",
        neighborhood: formData.get("neighborhood") ?? "",
        amenities: formData.getAll("amenities"),
        price_min: formData.get("price_min") ?? "0",
        price_max: formData.get("price_max") ?? "0",
      }
  }
}

/**
 * Preço no nível do anúncio (coluna `listings.price`, usada pelo card/feed e
 * pela ordenação). Produto/serviço mandam um campo `price` direto; roommate e
 * república mandam uma faixa (`price_min`/`price_max`) e usamos o mínimo —
 * é o valor que entra na ordenação "menor preço" do feed.
 */
function topLevelPriceFromForm(type: ListingType, formData: FormData): FormDataEntryValue | string {
  if (type === "roommate" || type === "republic") {
    return formData.get("price_min") ?? "0"
  }
  return formData.get("price") ?? "0"
}

export type ListingFormState = {
  error?: string
  /**
   * Eco dos campos enviados, pra re-preencher o formulário quando dá erro —
   * sem isso, a pessoa perdia tudo que já tinha digitado e precisava
   * preencher de novo (achado testando o fluxo de /anunciar).
   */
  values?: Record<string, string | string[]>
  /**
   * Incrementa a cada erro. `defaultValue` sozinho não é suficiente pra
   * re-preencher `<select>`/checkbox depois que o React reseta o form no fim
   * de uma Server Action (reseta pro estado em que o elemento montou, não
   * para um `defaultValue` atualizado) — funcionava para `<input>` de texto,
   * mas não para `<select>`. A página usa esse número como `key` pra forçar
   * o React a remontar os campos com os valores novos em vez de confiar no
   * reset nativo do navegador.
   */
  attempt?: number
}

/** Serializa o FormData (menos os arquivos) pra devolver como `values` no estado de erro. */
function echoFormValues(formData: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {}
  for (const key of new Set(formData.keys())) {
    if (key === "images") continue
    const all = formData.getAll(key).filter((value): value is string => typeof value === "string")
    if (all.length === 0) continue
    values[key] = all.length > 1 ? all : all[0]
  }
  return values
}

/** Monta o estado de erro com o eco dos campos e o contador de tentativa. */
function errorState(prevState: ListingFormState, error: string, formData: FormData): ListingFormState {
  return { error, values: echoFormValues(formData), attempt: (prevState.attempt ?? 0) + 1 }
}

/**
 * Action genérica dos 4 formulários de `/anunciar` (um `.bind(null, type)` por
 * tipo). Valida com o schema certo do tipo (Josué) antes de gravar, usando
 * `createListing`/`uploadImages` já existentes.
 */
export async function createListingForm(
  type: ListingType,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorState(_prevState, "Não autorizado", formData)

  const parsed = SCHEMA_BY_TYPE[type].safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    price: topLevelPriceFromForm(type, formData),
    campus_id: formData.get("campus_id") ?? "",
    type,
    details: detailsFromForm(type, formData),
  })
  if (!parsed.success) {
    return errorState(_prevState, parsed.error.issues[0]?.message ?? "Dados inválidos.", formData)
  }

  let imageUrls: string[] = []
  try {
    imageUrls = await uploadImages(formData)
  } catch (err) {
    return errorState(
      _prevState,
      err instanceof Error ? err.message : "Erro ao enviar as fotos.",
      formData,
    )
  }

  const status = formData.get("status") === "draft" ? "draft" : "active"

  await createListing(
    {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      type: parsed.data.type,
      campus_id: parsed.data.campus_id,
      details: parsed.data.details,
    },
    imageUrls,
    status,
  )

  return {}
}

/**
 * Edita um anúncio existente (só o dono) — campos de texto/seleção e fotos.
 */
export async function updateListing(
  id: string,
  type: ListingType,
  _prevState: ListingFormState,
  formData: FormData,
): Promise<ListingFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorState(_prevState, "Não autorizado", formData)

  const parsed = SCHEMA_BY_TYPE[type].safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    price: topLevelPriceFromForm(type, formData),
    campus_id: formData.get("campus_id") ?? "",
    type,
    details: detailsFromForm(type, formData),
  })
  if (!parsed.success) {
    return errorState(_prevState, parsed.error.issues[0]?.message ?? "Dados inválidos.", formData)
  }

  // Confere dono e fotos atuais ANTES de escrever qualquer coisa. Nunca
  // confiar só no `.eq("owner_id", user.id)` do update: ele simplesmente não
  // afeta nenhuma linha se o anúncio for de outra pessoa (sem erro), o que
  // esconderia a tentativa em vez de recusá-la com uma mensagem clara.
  const { data: current, error: currentError } = await supabase
    .from("listings")
    .select("owner_id, listing_images(path)")
    .eq("id", id)
    .maybeSingle()

  if (currentError || !current) {
    return errorState(_prevState, "Anúncio não encontrado.", formData)
  }
  if (current.owner_id !== user.id) {
    return errorState(_prevState, "Você não tem permissão para editar este anúncio.", formData)
  }

  const { error } = await supabase
    .from("listings")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      campus_id: parsed.data.campus_id,
      details: parsed.data.details,
    })
    .eq("id", id)
    .eq("owner_id", user.id)

  if (error) return errorState(_prevState, "Não foi possível salvar as alterações.", formData)

  // Fotos: o que ficou marcado como "mantido" no formulário só é aceito se já
  // pertencia a este anúncio de verdade — nunca confiar direto no `path` que
  // chega no campo oculto, ou alguém poderia forjar o path de outro anúncio
  // (de outro usuário) para "herdar" uma foto que não é dele.
  const pathsAtuais = (current.listing_images ?? []).map((image) => image.path)
  const pathsMantidos = formData
    .getAll("existing_image_paths")
    .filter((value): value is string => typeof value === "string")
    .filter((path) => pathsAtuais.includes(path))
  const pathsRemovidos = pathsAtuais.filter((path) => !pathsMantidos.includes(path))

  let novosPaths: string[] = []
  try {
    novosPaths = await uploadImages(formData)
  } catch (err) {
    // Os campos de texto já foram salvos acima; só as fotos falharam.
    return errorState(
      _prevState,
      err instanceof Error ? err.message : "Erro ao enviar as fotos.",
      formData,
    )
  }

  const pathsFinais = [...pathsMantidos, ...novosPaths]

  // Reescreve `listing_images` do zero com a lista final (mantidas + novas),
  // em vez de tentar um diff fino de posição — mais simples e já cobre
  // reordenar a capa quando a primeira foto é removida.
  const { error: deleteRowsError } = await supabase
    .from("listing_images")
    .delete()
    .eq("listing_id", id)

  if (deleteRowsError) {
    return errorState(_prevState, "Não foi possível atualizar as fotos.", formData)
  }

  if (pathsFinais.length > 0) {
    const { error: insertRowsError } = await supabase.from("listing_images").insert(
      pathsFinais.map((path, index) => ({ listing_id: id, path, position: index })),
    )
    if (insertRowsError) {
      return errorState(_prevState, "Não foi possível atualizar as fotos.", formData)
    }
  }

  // Limpeza do Storage é melhor-esforço: o anúncio já está consistente no
  // banco (as linhas de `listing_images` acima não referenciam mais esses
  // arquivos) mesmo que a remoção física falhe por um motivo transitório.
  if (pathsRemovidos.length > 0) {
    await supabase.storage.from("listing-images").remove(pathsRemovidos)
  }

  revalidatePath(`/anuncios/${id}`)
  revalidatePath("/meus-anuncios")
  redirect(`/anuncios/${id}`)
}

export async function deleteListing(id: string) {
  const supabase = await createClient()
  
  // O RLS do banco já garante que só o dono consegue deletar
  const { error } = await supabase.from('listings').delete().eq('id', id)
  
  if (error) throw new Error("Erro ao excluir anúncio")
  
  revalidatePath('/meus-anuncios')
  redirect('/meus-anuncios')
}