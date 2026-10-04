"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import { rotaSegura } from "@/src/lib/auth";
import {
  completarPerfilSchema,
  type CompletarPerfilInput,
} from "@/src/lib/validations/profile";
import type { AuthActionResult } from "@/src/app/(auth)/cadastro/actions";

/** Salva o campus escolhido (e a universidade dele) no perfil da pessoa logada. */
export async function completarPerfil(input: CompletarPerfilInput): Promise<AuthActionResult> {
  const parsed = completarPerfilSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Selecione um campus válido." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/entrar");

  const { data: campus } = await supabase
    .from("campuses")
    .select("university_id")
    .eq("id", parsed.data.campusId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ campus_id: parsed.data.campusId, university_id: campus?.university_id ?? null })
    .eq("id", user.id);

  if (error) {
    return { error: "Não foi possível salvar seu campus. Tente novamente." };
  }

  redirect(rotaSegura(parsed.data.next));
}
