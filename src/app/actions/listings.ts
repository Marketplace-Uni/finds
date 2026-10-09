"use server"

import { createClient } from "../../lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function uploadImages(formData: FormData) {
  const supabase = await createClient()
  const files = formData.getAll("images") as File[]
  const uploadedUrls: string[] = []

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autorizado")

  for (const file of files) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `listings/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(filePath, file)

    if (uploadError) throw new Error("Erro no upload da imagem")

    const { data: { publicUrl } } = supabase.storage
      .from('listing-images')
      .getPublicUrl(filePath)

    uploadedUrls.push(publicUrl)
  }

  return uploadedUrls
}

// Atualize a função createListing para aceitar 'status' dinâmico
// ATENÇÃO: Corrigimos o status para inglês (active, draft)
export async function createListing(data: any, imageUrls: string[], status: 'active' | 'draft' = 'active') {
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

export async function deleteListing(id: string) {
  const supabase = await createClient()
  
  // O RLS do banco já garante que só o dono consegue deletar
  const { error } = await supabase.from('listings').delete().eq('id', id)
  
  if (error) throw new Error("Erro ao excluir anúncio")
  
  revalidatePath('/meus-anuncios')
  redirect('/meus-anuncios')
}