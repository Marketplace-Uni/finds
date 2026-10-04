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

export async function createListing(data: any, imageUrls: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Não autorizado")

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      user_id: user.id,
      title: data.title,
      description: data.description,
      price: data.price,
      type: data.type,
      campus_id: data.campus_id,
      details: data.details,
      status: 'ativo',
      images: imageUrls 
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/')
  redirect(`/anuncios/${listing.id}`)
}

export async function deleteListing(id: string) {
  const supabase = await createClient()
  
  // O RLS do banco já garante que só o dono consegue deletar
  const { error } = await supabase.from('listings').delete().eq('id', id)
  
  if (error) throw new Error("Erro ao excluir anúncio")
  
  revalidatePath('/meus-anuncios')
  redirect('/meus-anuncios')
}