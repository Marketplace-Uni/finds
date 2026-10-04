"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import { rotaSegura } from "@/src/lib/auth";
import { entrarSchema, type EntrarInput } from "@/src/lib/validations/auth";
import type { AuthActionResult } from "@/src/app/(auth)/cadastro/actions";

/** Autentica por e-mail/senha e redireciona para `next` (ou `/`). */
export async function entrar(input: EntrarInput, next?: string): Promise<AuthActionResult> {
  const parsed = entrarSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Confira os campos destacados e tente de novo." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { error: "E-mail ou senha incorretos." };
  }

  redirect(rotaSegura(next));
}
