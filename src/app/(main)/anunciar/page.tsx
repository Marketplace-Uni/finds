import Link from "next/link"
// TODO: Importar o Gate de Perfil Completo do Kaike aqui

export default function AnunciarPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">O que você quer anunciar?</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/anunciar/produto" className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h2 className="text-xl font-semibold mb-2">Produto</h2>
          <p className="text-gray-600">Venda materiais, eletrônicos, roupas e mais.</p>
        </Link>
        
        <Link href="/anunciar/servico" className="p-6 border rounded-lg hover:shadow-lg transition-shadow bg-white">
          <h2 className="text-xl font-semibold mb-2">Serviço</h2>
          <p className="text-gray-600">Ofereça aulas, manutenções, fretes e trabalhos.</p>
        </Link>

        {/* Sprint 2 - Desabilitados por enquanto */}
        <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Roommate</h2>
          <p className="text-gray-600">Em breve (Sprint 2)</p>
        </div>
        
        <div className="p-6 border rounded-lg opacity-50 cursor-not-allowed bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">República</h2>
          <p className="text-gray-600">Em breve (Sprint 2)</p>
        </div>
      </div>
    </div>
  )
}