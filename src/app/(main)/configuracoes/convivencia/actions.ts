"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/lib/auth";
import { convivenciaSchema } from "@/src/lib/validations/profile";
import { saveUserTraits } from "@/src/lib/traits";

export type ConvivenciaState = {
  error?: string;
  success?: boolean;
  /** Incrementa a cada chamada — o client usa isso pra disparar o aviso de
   * confirmação só uma vez por envio (mesmo padrão de `ListingFormState.attempt`). */
  attempt?: number;
};

/**
 * Recebe o `FormData` nativo do `<ConvivenciaPicker>` (campos `sou`/`procuro`,
 * um valor por checkbox marcado) e substitui o perfil de convivência do
 * usuário logado.
 */
export async function salvarConvivencia(
  prevState: ConvivenciaState,
  formData: FormData,
): Promise<ConvivenciaState> {
  const attempt = (prevState.attempt ?? 0) + 1;
  const user = await requireUser("/configuracoes/convivencia");

  const parsed = convivenciaSchema.safeParse({
    sou: formData.getAll("sou"),
    procuro: formData.getAll("procuro"),
  });
  if (!parsed.success) {
    return { error: "Não foi possível salvar — confira as tags marcadas.", attempt };
  }

  await saveUserTraits(user.id, parsed.data);

  revalidatePath("/configuracoes/convivencia");
  revalidatePath("/roommates");

  return { success: true, attempt };
}
