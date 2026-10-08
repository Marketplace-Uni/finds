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
export async function createListing(data: any, imageUrls: string[], status: 'ativo' | 'rascunho' = 'ativo') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Não autorizado")

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: data.title || "Rascunho sem título", // Rascunhos podem vir incompletos
      description: data.description || "",
      price: data.price || 0,
      type: data.type,
      campus_id: data.campus_id,
      details: data.details || {},
      status: status, // Aqui entra 'rascunho' ou 'ativo'
      images: imageUrls 
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/meus-anuncios')
  redirect(status === 'rascunho' ? '/meus-anuncios' : `/anuncios/${listing.id}`)
}

// Nova Action para gerenciar Pausar, Encerrar e Ativar
export async function updateListingStatus(id: string, newStatus: 'ativo' | 'pausado' | 'encerrado') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Não autorizado")

  // O RLS já blinda, mas garantimos que a query busque pelo dono
  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id)

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