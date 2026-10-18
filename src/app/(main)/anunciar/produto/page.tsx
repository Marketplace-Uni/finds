import { requireCompleteProfile } from "@/src/lib/auth";
import { fetchCampusOptions } from "@/src/lib/listings";
import { ProdutoForm } from "./produto-form";

export default async function AnunciarProdutoPage() {
  await requireCompleteProfile("/anunciar/produto");
  const campuses = await fetchCampusOptions();

  return <ProdutoForm campuses={campuses} />;
}
