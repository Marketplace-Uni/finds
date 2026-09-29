import Link from "next/link";
import { Heart, MapPin, MessageCircle, Plus, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { UserMenu, type NavbarUser } from "@/src/components/layout/user-menu";

type NavbarProps = {
  /** Quem está logado. `null` mostra a navbar de visitante. */
  user?: NavbarUser | null;
  /** Campus escolhido, mostrado ao lado do alfinete. */
  campus?: string | null;
  /** Conversas não lidas; o badge só aparece acima de zero. */
  unreadCount?: number;
};

/**
 * Navbar do desktop. No Figma a navegação é uma barra inferior escura no
 * mobile (Home, mensagens, favoritos, perfil) e a busca fica no topo — no
 * desktop as duas viram esta única barra, conforme docs/DESIGN.md.
 *
 * É visual: recebe tudo por props e não acessa o banco.
 */
export function Navbar({ user = null, campus = null, unreadCount = 0 }: NavbarProps) {
  return (
    <header className="bg-nav text-nav-foreground">
      <div className="mx-auto flex h-16 max-w-conteudo items-center gap-4 px-6">
        {/* TODO: trocar pelo logo em SVG quando a Lia enviar (hoje é imagem no Figma). */}
        <Link
          href="/"
          className="font-sans text-2xl font-bold tracking-tight text-primary"
        >
          finds
        </Link>

        <form action="/busca" className="relative min-w-0 flex-1">
          <label htmlFor="busca-navbar" className="sr-only">
            Buscar anúncios
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="busca-navbar"
            type="search"
            name="q"
            placeholder="O que você está procurando hoje?"
            className="h-10 w-full rounded-md bg-muted pr-4 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
          />
        </form>

        {campus ? (
          <span className="hidden items-center gap-1 text-sm lg:flex">
            <MapPin className="size-4 text-secondary" aria-hidden />
            {campus}
          </span>
        ) : null}

        {user ? (
          <nav className="flex items-center gap-1" aria-label="Atalhos da conta">
            <Button
              asChild
              className="rounded-pill bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/anunciar">
                <Plus aria-hidden />
                Anunciar
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="text-nav-foreground hover:bg-white/10"
            >
              <Link href="/favoritos" aria-label="Favoritos">
                <Heart aria-hidden />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-nav-foreground hover:bg-white/10"
            >
              <Link href="/mensagens" aria-label="Mensagens">
                <MessageCircle aria-hidden />
                {unreadCount > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 grid min-w-4 place-items-center rounded-pill bg-primary px-1 text-[10px] leading-4 font-bold text-primary-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                ) : null}
              </Link>
            </Button>

            <UserMenu user={user} />
          </nav>
        ) : (
          <nav className="flex items-center gap-2" aria-label="Entrar ou criar conta">
            <Button
              asChild
              variant="ghost"
              className="rounded-pill text-nav-foreground hover:bg-white/10"
            >
              <Link href="/entrar">Entrar</Link>
            </Button>
            <Button
              asChild
              className="rounded-pill bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/cadastro">Criar conta</Link>
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}
