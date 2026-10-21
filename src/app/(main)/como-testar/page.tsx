import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/src/components/ui/button";
import { Zeca } from "@/src/components/ui/zeca";
import { CONTAS_TESTE } from "@/src/lib/contas-teste";

export const metadata: Metadata = { title: "Como testar — Finds" };

/**
 * Página pública (sem sessão exigida, ver src/app/(main)/layout.tsx) pra
 * visitantes da Mostra testarem sem passar pelo cadastro: o Supabase free
 * tier limita e-mail de confirmação por hora, então em vez de se cadastrar,
 * o visitante usa uma das 5 contas abaixo.
 *
 * Ainda não existe um primitivo de tabela/card em src/components/ui — reaproveita
 * o padrão simples já usado na landing page (bg-card rounded-lg p-6) em vez de
 * inventar estilo novo; o Caike pode refinar isso depois.
 */
export default function ComoTestarPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 py-10 text-center">
      <Zeca pose={1} className="h-32 w-auto text-primary" />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Quer só testar o Finds?</h1>
        <p className="text-muted-foreground">
          Esse é um evento ao vivo e o cadastro normal depende de confirmação por
          e-mail, que tem limite no plano gratuito que usamos. Pra não esbarrar
          nisso, use uma das contas de demonstração abaixo — sem precisar criar a
          sua.
        </p>
      </div>

      <ul className="grid w-full gap-3 sm:grid-cols-2">
        {CONTAS_TESTE.map((conta) => (
          <li key={conta.email} className="flex flex-col gap-1 rounded-lg bg-card p-4 text-left">
            <span className="text-xs font-semibold text-muted-foreground">E-mail</span>
            <span className="font-mono text-sm text-foreground">{conta.email}</span>
            <span className="mt-2 text-xs font-semibold text-muted-foreground">Senha</span>
            <span className="font-mono text-sm text-foreground">{conta.senha}</span>
          </li>
        ))}
      </ul>

      <p className="max-w-prose text-sm text-muted-foreground">
        Essas contas nascem vazias de propósito: complete o perfil, anuncie algo,
        experimente o match de roommates. Elas são compartilhadas com outros
        visitantes ao longo do dia, então nada que você criar ali é privado ou
        permanente.
      </p>

      <Button asChild className="rounded-pill px-8 py-6 text-base font-bold">
        <Link href="/entrar">Entrar com uma conta de demonstração</Link>
      </Button>
    </div>
  );
}
