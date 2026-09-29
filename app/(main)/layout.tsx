import { Navbar } from "@/src/components/layout/navbar";

/**
 * Layout das telas logadas: navbar no topo e conteúdo centralizado.
 *
 * TODO (Kaike): a sessão ainda não é lida aqui. Quando o auth estiver de pé,
 * passar `user`, `campus` e `unreadCount` para a Navbar.
 */
export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-conteudo flex-1 px-6 py-8">{children}</main>
    </>
  );
}
