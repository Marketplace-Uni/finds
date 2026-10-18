import { Navbar } from "@/src/components/layout/navbar";
import { CompleteProfileProvider } from "@/src/components/auth/complete-profile-gate";
import { getCurrentProfile, touchLastSeen } from "@/src/lib/auth";
import { getUnreadMessageCount } from "@/src/lib/chat/unread";
import { createClient } from "@/src/lib/supabase/server";

/**
 * Layout das telas logadas: navbar no topo e conteúdo centralizado.
 *
 * Lê a sessão e o perfil aqui (Server Component) e repassa pra Navbar; o
 * `<CompleteProfileProvider>` guarda se o perfil está completo pra qualquer
 * `useCompleteProfileGate()` filho abrir o modal em vez de navegar.
 */
export default async function MainLayout({ children }: LayoutProps<"/">) {
  const profile = await getCurrentProfile();
  if (profile) await touchLastSeen(profile);

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

  // A contagem é enfeite: se falhar, a navbar mostra zero em vez de derrubar
  // todas as telas logadas, que é o que um throw aqui faria.
  let unreadCount = 0;
  if (profile) {
    try {
      unreadCount = await getUnreadMessageCount(profile.id);
    } catch {
      unreadCount = 0;
    }
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
      <Navbar user={navbarUser} campus={campusLabel} unreadCount={unreadCount} />
      <main className="mx-auto w-full max-w-conteudo flex-1 px-6 py-8">{children}</main>
    </CompleteProfileProvider>
  );
}
