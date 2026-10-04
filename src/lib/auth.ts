import { redirect } from "next/navigation";

import { createClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Só redireciona para rotas internas — evita open redirect via `?next=`.
 * Usada por qualquer Server Action que aceite um `next` vindo da URL.
 */
export function rotaSegura(next: string | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

function loginRedirect(nextPath?: string): never {
  const query = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
  redirect(`/entrar${query}`);
}

function completeProfileRedirect(nextPath: string): never {
  redirect(`/completar-perfil?next=${encodeURIComponent(nextPath)}`);
}

/** Perfil da pessoa logada, ou `null` se não houver sessão. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

/**
 * Exige um usuário autenticado. Sem sessão, redireciona para `/entrar`
 * (preservando `nextPath` para voltar depois do login).
 */
export async function requireUser(nextPath?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) loginRedirect(nextPath);
  return user;
}

/**
 * Exige um perfil completo (hoje: `campus_id` preenchido). Sem sessão,
 * redireciona para `/entrar`; com sessão mas perfil incompleto, redireciona
 * para `/completar-perfil?next=...`.
 *
 * Use em qualquer Server Component/Action que dependa de um perfil pronto
 * (ex.: anunciar, favoritar, iniciar conversa, avaliar).
 */
export async function requireCompleteProfile(nextPath: string): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) loginRedirect(nextPath);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.campus_id) completeProfileRedirect(nextPath);

  return profile;
}
