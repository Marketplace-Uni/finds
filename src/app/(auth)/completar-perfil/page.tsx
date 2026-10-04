import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { EmptyState, ErrorState } from "@/src/components/ui/states";
import { CompletarPerfilForm, type CampusOption } from "./completar-perfil-form";

export default async function CompletarPerfilPage({
  searchParams,
}: PageProps<"/completar-perfil">) {
  const { next: nextParam } = await searchParams;
  const next = typeof nextParam === "string" ? nextParam : undefined;

  await requireUser(next ?? "/completar-perfil");

  const supabase = await createClient();
  const { data: campuses, error } = await supabase
    .from("campuses")
    .select("id, name, city")
    .order("name");

  if (error) {
    return (
      <ErrorState description="Não conseguimos carregar a lista de campus. Recarregue a página." />
    );
  }

  const opcoes: CampusOption[] = (campuses ?? []).map((campus) => ({
    id: campus.id,
    label: `${campus.name} — ${campus.city}`,
  }));

  if (opcoes.length === 0) {
    return (
      <EmptyState
        title="Nenhum campus cadastrado ainda"
        description="Fale com o time: falta popular os dados de referência."
      />
    );
  }

  return <CompletarPerfilForm campuses={opcoes} next={next} />;
}
