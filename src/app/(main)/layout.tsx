import { Navbar } from "@/src/components/layout/navbar";
import { CompleteProfileProvider } from "@/src/components/auth/complete-profile-gate";
import { getCurrentProfile } from "@/src/lib/auth";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Layout das telas logadas: navbar no topo e conteúdo centralizado.
 *
 * Lê a sessão e o perfil aqui (Server Component) e repassa pra Navbar; o
 * `<CompleteProfileProvider>` guarda se o perfil está completo pra qualquer
 * `useCompleteProfileGate()` filho abrir o modal em vez de navegar.
 *
 * TODO (Alexandre): `unreadCount` de mensagens não lidas ainda está fixo em 0.
 */
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const profile = await getCurrentProfile();

  let campusLabel: string | null = null;
  if (profile?.campus_id) {
    const supabase = await createClient();
    const { data: campus } = await supabase
      .from("campuses")
      .select("name, city")
      .eq("id", profile.campus_id)
      .single();
    campusLabel = campus ? `${campus.name}, ${campus.city}` : null;
  }

  const navbarUser = profile
    ? {
        name: profile.full_name ?? profile.username ?? "Perfil",
        username: profile.username ?? "",
        avatarUrl: profile.avatar_url,
      }
    : null;

  return (
    <CompleteProfileProvider isComplete={Boolean(profile?.campus_id)}>
      <Navbar user={navbarUser} campus={campusLabel} />
      <main className="mx-auto w-full max-w-conteudo flex-1 px-6 py-8">{children}</main>
    </CompleteProfileProvider>
  );
}
