import { NextResponse } from "next/server";

import { createClient } from "@/src/lib/supabase/server";

/** Logout: o `<UserMenu>` do Caike já linka "Sair" pra cá. */
export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
