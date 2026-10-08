import { createClient } from "../../../lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MeusAnunciosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Busca todos os anúncios do usuário logado ordenados por data
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return <p>Erro ao carregar anúncios.</p>
  }

  // Filtros pré-processados no backend para entregar pronto ao Caike
  const ativos = listings?.filter(l => l.status === 'ativo' || l.status === 'pausado') || []
  const rascunhos = listings?.filter(l => l.status === 'rascunho') || []
  const encerrados = listings?.filter(l => l.status === 'encerrado') || []

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Meus Anúncios</h1>
      
      {/* 
        TODO CAIKE: 
        Importar o componente visual de Abas (Tabs) aqui.
        Use as variáveis 'ativos', 'rascunhos' e 'encerrados' geradas acima 
        para popular a lista. Adicionar botões que chamem a action 'updateListingStatus'
        e 'deleteListing'.
      */}
      
      <div className="bg-gray-50 border p-6 rounded">
        <p className="text-gray-600">Base de dados carregada! Repassando layout para o front-end...</p>
        <p className="mt-2 font-mono text-sm">Total Ativos: {ativos.length}</p>
        <p className="font-mono text-sm">Total Rascunhos: {rascunhos.length}</p>
        <p className="font-mono text-sm">Total Encerrados: {encerrados.length}</p>
      </div>
    </div>
  )
}