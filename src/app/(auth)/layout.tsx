import Link from "next/link";

import { AuthArt } from "@/src/components/layout/auth-art";
import { LogoFinds } from "@/src/components/layout/logo-finds";

/**
 * Layout das telas de conta (entrar, cadastro, verificar e-mail, recuperar
 * senha). Sem navbar: é **tela dividida**, com a marca à esquerda e o
 * formulário à direita. No celular sobra só o formulário, com o logo no topo.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="grid min-h-svh flex-1 lg:grid-cols-2">
      <AuthArt />

      <main className="flex flex-col items-center justify-center gap-8 px-6 py-12">
        <Link href="/" className="text-primary lg:hidden" aria-label="Finds, página inicial">
          <LogoFinds className="h-8 w-auto" />
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}
