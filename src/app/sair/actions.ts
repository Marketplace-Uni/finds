"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/src/lib/supabase/server";

/**
 * Desloga e manda pro login. Troquei o antigo Route Handler GET (que exigia
 * dar F5 pra aplicar: `<Link>` navega client-side e o Router Cache mantinha
 * o navbar "logado" até recarregar a página) por uma Server Action, como
 * `entrar()`/`cadastrar()` já fazem: `revalidatePath` invalida o cache do
 * layout e o `redirect()` troca de página sem precisar de reload manual.
 */
export async function sairAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/entrar");
}
