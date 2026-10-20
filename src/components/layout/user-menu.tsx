"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, Loader2, Settings, Tag, User as UserIcon, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { sairAction } from "@/src/app/sair/actions";

export type NavbarUser = {
  name: string;
  username: string;
  avatarUrl?: string | null;
};

/** Iniciais para quando a pessoa não tem foto. */
function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function UserMenu({ user }: { user: NavbarUser }) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="group flex items-center gap-1.5 rounded-pill p-0.5 outline-none transition-colors hover:bg-primary/60 focus-visible:ring-2 focus-visible:ring-secondary"
        aria-label="Abrir menu da conta"
      >
        <Avatar className="size-9 border-2 border-secondary">
          <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown
          className="size-4 text-nav-foreground transition-transform duration-200 group-hover:text-primary-foreground group-data-[state=open]:rotate-180"
          aria-hidden
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <span className="block font-semibold">{user.name}</span>
          <span className="block text-xs text-muted-foreground">@{user.username}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/perfil/${user.username}`}>
            <UserIcon aria-hidden />
            Meu perfil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/meus-anuncios">
            <Tag aria-hidden />
            Meus anúncios
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes">
            <Settings aria-hidden />
            Configurações
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracoes/convivencia">
            <Users aria-hidden />
            Perfil de convivência
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={isSigningOut}
          onSelect={(event) => {
            // Mantém o menu aberto pra dar tempo de mostrar "Saindo...":
            // por padrão o Radix fecha o menu assim que um item é selecionado.
            event.preventDefault();
            setIsSigningOut(true);
            sairAction();
          }}
        >
          {isSigningOut ? (
            <Loader2 className="animate-spin" aria-hidden />
          ) : (
            <LogOut aria-hidden />
          )}
          {isSigningOut ? "Saindo..." : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
