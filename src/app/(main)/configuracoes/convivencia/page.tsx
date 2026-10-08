import { requireUser } from "@/src/lib/auth";
import { fetchTraits, fetchUserTraits } from "@/src/lib/traits";
import { ConvivenciaPicker } from "@/src/components/match/convivencia-picker";
import { ErrorState } from "@/src/components/ui/states";
import { salvarConvivencia } from "./actions";

export default async function ConvivenciaPage() {
  const user = await requireUser("/configuracoes/convivencia");

  const [traits, userTraits] = await Promise.all([fetchTraits(), fetchUserTraits(user.id)]);

  if (traits.length === 0) {
    return (
      <ErrorState
        title="Tags de convivência não cadastradas"
        description="Fale com o time: falta popular os dados de referência (traits)."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Perfil de convivência</h1>
        <p className="text-sm text-muted-foreground">
          É o que alimenta o match de roommates: marque como você é e o que você procura em quem
          vai dividir moradia.
        </p>
      </div>

      <ConvivenciaPicker
        traits={traits}
        self={[...userTraits.self]}
        wanted={[...userTraits.wanted]}
        action={salvarConvivencia}
      />
    </div>
  );
}
