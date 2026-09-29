"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Settings, Tag, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

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
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 rounded-pill p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        aria-label="Abrir menu da conta"
      >
        <Avatar className="size-9 border-2 border-secondary">
          <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
          <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 text-nav-foreground" aria-hidden />
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
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/sair">
            <LogOut aria-hidden />
            Sair
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
