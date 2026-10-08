import Link from "next/link";

import { getCurrentProfile, requireUser } from "@/src/lib/auth";
import { fetchCampusOptions } from "@/src/lib/listings";
import { ErrorState } from "@/src/components/ui/states";
import { EditarPerfilForm } from "./editar-perfil-form";

export default async function ConfiguracoesPage() {
  await requireUser("/configuracoes");

  const profile = await getCurrentProfile();
  if (!profile) {
    return <ErrorState description="Não conseguimos carregar o seu perfil. Recarregue a página." />;
  }

  const campuses = await fetchCampusOptions();

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Edite seus dados de perfil.{" "}
          <Link href="/configuracoes/convivencia" className="font-semibold text-primary">
            Perfil de convivência
          </Link>{" "}
          fica em outra página.
        </p>
      </div>

      <EditarPerfilForm profile={profile} campuses={campuses} />
    </div>
  );
}
