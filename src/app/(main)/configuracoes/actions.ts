"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";
import { editarPerfilSchema } from "@/src/lib/validations/profile";

export type EditarPerfilState = {
  error?: string;
  success?: boolean;
};

/**
 * Salva nome, bio, campus e (opcionalmente) a foto de perfil.
 *
 * Form nativo (não react-hook-form): o `<input type="file">` da foto precisa
 * de um `<form action={...}>` de verdade, como já é feito em
 * `src/app/actions/listings.ts` para fotos de anúncio.
 */
export async function editarPerfil(
  _prevState: EditarPerfilState,
  formData: FormData,
): Promise<EditarPerfilState> {
  const user = await requireUser("/configuracoes");
  const supabase = await createClient();

  // `?? ""` em vez de repassar o que `FormData.get()` devolve direto: um
  // <select> sem opção não-desabilitada selecionada (ex.: lista de campus
  // vazia) não manda nenhum valor pro form, e vira `null` aqui — o que faria
  // o zod reclamar com uma mensagem de erro de tipo em inglês, em vez da
  // mensagem em pt-BR do `.uuid()`.
  const parsed = editarPerfilSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    bio: formData.get("bio") ?? "",
    campusId: formData.get("campusId") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  let avatarUrl: string | undefined;
  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    // Path fixo por usuário (não aleatório): sobrescreve a foto antiga em vez
    // de acumular arquivos órfãos no bucket, e já fica restrito à "pasta" do
    // próprio usuário, como pede a policy de storage documentada em
    // docs/ARQUITETURA.md.
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true });
    if (uploadError) return { error: "Erro ao enviar a foto. Tente novamente." };

    avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      bio: parsed.data.bio || null,
      campus_id: parsed.data.campusId,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) return { error: "Não foi possível salvar. Tente novamente." };

  revalidatePath("/configuracoes");
  revalidatePath("/", "layout");
  return { success: true };
}
