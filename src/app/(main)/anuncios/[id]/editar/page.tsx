import { createClient } from "../../../../../lib/supabase/server"
import { redirect } from "next/navigation"

// 1. A tipagem de params agora é uma Promise
export default async function EditarAnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  // 2. Extraímos o id usando await
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/entrar')
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id) // 3. Usamos o id diretamente aqui
    .single()

  if (error || !listing) {
    redirect('/404')
  }

  // Validação principal: só o dono pode editar
  if (listing.owner_id !== user.id) {
    redirect('/')
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Editar Anúncio: {listing.title}</h1>
      
      {/* 
        Aqui você vai importar o componente de Formulário (Wizard) do Caike
        passando o 'listing' como defaultValues para preencher os campos.
      */}
      <p>Área reservada para o formulário do Caike.</p>
    </div>
  )
}