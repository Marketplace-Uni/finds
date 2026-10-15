import Link from "next/link";
import { Heart, MapPin, MessageCircle, Plus, Search } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { UserMenu, type NavbarUser } from "@/src/components/layout/user-menu";
import { UnreadBadge } from "@/src/components/chat/unread-badge";

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
      {/* No celular a busca cai para a segunda linha: logo e ações não cabem
          junto com ela. A partir de md tudo volta para uma linha só. */}
      <div className="mx-auto flex max-w-conteudo flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 md:h-16 md:flex-nowrap md:py-0">
        {/* Logo em verde-limão, a pedido da Lia (07/10). */}
        <Link
          href="/"
          className="shrink-0 text-secondary"
          aria-label="Finds, página inicial"
        >
          <LogoFinds className="h-6 w-auto sm:h-7" />
        </Link>

        <form
          action="/busca"
          // `basis-full` (e não `w-full`) é o que força a quebra de linha: com
          // `flex-1` a base vai a zero e o campo encolhe em vez de descer.
          className="relative order-last min-w-0 basis-full md:order-none md:flex-1 md:basis-auto"
        >
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
          <nav className="ml-auto flex items-center gap-1 md:ml-0" aria-label="Atalhos da conta">
            <Button
              asChild
              className="rounded-pill bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/anunciar">
                <Plus aria-hidden />
                <span className="hidden sm:inline">Anunciar</span>
              </Link>
            </Button>

            {/* Ícones maiores e da mesma altura do avatar, a pedido da Lia. */}
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-10 text-nav-foreground hover:bg-primary/60 hover:text-primary-foreground [&_svg]:size-5"
            >
              <Link href="/favoritos" aria-label="Favoritos">
                <Heart aria-hidden strokeWidth={2.5} />
              </Link>
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative size-10 text-nav-foreground hover:bg-primary/60 hover:text-primary-foreground [&_svg]:size-5"
            >
              <Link href="/mensagens" aria-label="Mensagens">
                <MessageCircle aria-hidden />
                {/* O badge é do Alexandre: usar o componente dele em vez de
                    repetir o visual aqui mantém os dois iguais. */}
                <span className="absolute top-0.5 right-0.5">
                  <UnreadBadge count={unreadCount} />
                </span>
              </Link>
            </Button>

            <UserMenu user={user} />
          </nav>
        ) : (
          <nav className="ml-auto flex items-center gap-2 md:ml-0" aria-label="Entrar ou criar conta">
            <Button
              asChild
              variant="ghost"
              className="rounded-pill text-nav-foreground hover:bg-primary/60 hover:text-primary-foreground"
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
