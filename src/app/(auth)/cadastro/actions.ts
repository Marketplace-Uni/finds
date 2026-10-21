"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import { cadastroSchema, type CadastroInput } from "@/src/lib/validations/auth";

export type AuthActionResult = { error: string } | { error: null };

function mapCadastroError(message: string): string {
  if (message.toLowerCase().includes("already registered")) {
    return "Já existe uma conta com esse e-mail.";
  }
  return "Não foi possível criar sua conta. Tente novamente em instantes.";
}

/**
 * Cria a conta (Supabase Auth) e envia o e-mail de confirmação @ufu.br.
 *
 * `origin` vem do cliente (`window.location.origin`), mesmo padrão de
 * `recuperarSenha()`: sem `emailRedirectTo` explícito, o Supabase usa o
 * "Site URL" do projeto (painel do Supabase) como destino do link — por
 * isso o link de confirmação ia pra localhost mesmo em produção. Esse
 * endereço também precisa estar nas "Redirect URLs" do projeto Supabase
 * (finds-dev/finds-demo), senão o Supabase rejeita o redirect (ver issue #28).
 */
export async function cadastrar(
  input: CadastroInput,
  origin: string,
): Promise<AuthActionResult> {
  const parsed = cadastroSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Confira os campos destacados e tente de novo." };
  }

  const { nome, username, email, senha } = parsed.data;
  const supabase = await createClient();

  // `username`/`full_name` vão pro trigger `handle_new_user()`
  // (supabase/migrations/20260927205727_inicializar_esquema.sql), que cria a
  // linha em `profiles` a partir de `raw_user_meta_data`.
  const { error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { username, full_name: nome },
      emailRedirectTo: `${origin}/entrar`,
    },
  });

  if (error) {
    return { error: mapCadastroError(error.message) };
  }

  redirect("/verificar-email");
}
