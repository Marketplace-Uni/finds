import { requireCompleteProfile } from "@/src/lib/auth";
import { fetchCampusOptions } from "@/src/lib/listings";
import { ServicoForm } from "./servico-form";

export default async function AnunciarServicoPage() {
  await requireCompleteProfile("/anunciar/servico");
  const campuses = await fetchCampusOptions();

  return <ServicoForm campuses={campuses} />;
}
