import { requireCompleteProfile } from "@/src/lib/auth";
import { fetchCampusOptions } from "@/src/lib/listings";
import { RepublicaForm } from "./republica-form";

export default async function AnunciarRepublicaPage() {
  await requireCompleteProfile("/anunciar/republica");
  const campuses = await fetchCampusOptions();

  return <RepublicaForm campuses={campuses} />;
}
