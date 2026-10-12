"use server";

import { createClient } from "@/src/lib/supabase/server";
import { recuperarSenhaSchema, type RecuperarSenhaInput } from "@/src/lib/validations/auth";
import type { AuthActionResult } from "@/src/app/(auth)/cadastro/actions";

/**
 * Envia o e-mail de recuperação de senha do Supabase. `origin` vem do
 * cliente (`window.location.origin`) pra montar o link de volta certo em
 * cada ambiente (localhost, preview da Vercel, produção) — esse endereço
 * precisa estar cadastrado nas "Redirect URLs" do projeto Supabase
 * (finds-dev/finds-demo), senão o Supabase rejeita o redirect.
 */
export async function recuperarSenha(
  input: RecuperarSenhaInput,
  origin: string,
): Promise<AuthActionResult> {
  const parsed = recuperarSenhaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Confira o e-mail e tente de novo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/redefinir-senha`,
  });

  if (error) {
    return { error: "Não foi possível enviar o e-mail agora. Tente novamente em instantes." };
  }

  // Não confirma se o e-mail existe ou não: evita enumeração de contas.
  return { error: null };
}
