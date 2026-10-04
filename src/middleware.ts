import { type NextRequest } from "next/server";

import { updateSession } from "@/src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em tudo, exceto assets estáticos e arquivos com extensão
     * (imagens, fontes, etc.) — padrão recomendado pelo `@supabase/ssr`.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
