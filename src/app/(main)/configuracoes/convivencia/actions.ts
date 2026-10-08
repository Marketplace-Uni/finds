"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/lib/auth";
import { convivenciaSchema } from "@/src/lib/validations/profile";
import { saveUserTraits } from "@/src/lib/traits";

/**
 * Recebe o `FormData` nativo do `<ConvivenciaPicker>` (campos `sou`/`procuro`,
 * um valor por checkbox marcado) e substitui o perfil de convivência do
 * usuário logado.
 */
export async function salvarConvivencia(formData: FormData): Promise<void> {
  const user = await requireUser("/configuracoes/convivencia");

  const parsed = convivenciaSchema.safeParse({
    sou: formData.getAll("sou"),
    procuro: formData.getAll("procuro"),
  });
  if (!parsed.success) return;

  await saveUserTraits(user.id, parsed.data);

  revalidatePath("/configuracoes/convivencia");
  revalidatePath("/roommates");
}
