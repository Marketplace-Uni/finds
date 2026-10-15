import Link from "next/link";
import { Handshake, House, ShoppingBag, Wrench } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { Zeca } from "@/src/components/ui/zeca";
import { cn } from "@/src/lib/utils";

const TIPOS = [
  {
    Icone: ShoppingBag,
    titulo: "Produtos",
    texto: "Da calculadora que você não usa mais ao móvel que não cabe na mudança.",
  },
  {
    Icone: Wrench,
    titulo: "Serviços",
    texto: "Aula particular, conserto, design, frete. Quem faz bem está do seu lado.",
  },
  {
    Icone: House,
    titulo: "Repúblicas",
    texto: "Vagas perto do campus, anunciadas por quem já mora lá.",
  },
  {
    Icone: Handshake,
    titulo: "Roommates",
    texto: "Ache alguém para dividir moradia com a rotina parecida com a sua.",
  },
];

const PASSOS = [
  {
    numero: "1",
    titulo: "Entre com seu e-mail @ufu.br",
    texto: "Só quem é da UFU participa. É isso que faz o Finds ser diferente.",
  },
  {
    numero: "2",
    titulo: "Anuncie ou procure",
    texto: "Publique em poucos passos ou use os filtros para achar pelo seu campus.",
  },
  {
    numero: "3",
    titulo: "Combine pelo chat",
    texto: "Converse, proponha a negociação e encontre a pessoa na universidade.",
  },
];

/**
 * Landing para quem ainda não entrou. Aparece na raiz quando não há sessão;
 * com sessão, a raiz mostra o feed (decisão do Caike em 11/10).
 *
 * Não existe no Figma — composta com os tokens, o logo e o Zeca, seguindo o
 * padrão já aprovado pela Lia (ver docs/DESIGN.md).
 *
 * É visual e não acessa o banco.
 */
export function LandingPage({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <section className="relative overflow-hidden bg-nav px-6 py-20">
        {/* Sem o Zeca e alinhado à esquerda, a pedido da Lia (14/10). */}
        <div className="relative z-10 mx-auto flex max-w-conteudo flex-col items-start gap-5">
          {/* Respiro extra entre a marca e a chamada. */}
          <LogoFinds className="mb-6 h-12 w-auto text-secondary" />

          <h1 className="max-w-3xl text-4xl leading-tight font-bold text-nav-foreground sm:text-5xl">
            O marketplace de quem é da UFU
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-nav-foreground/80">
            Compre, venda, ofereça serviços e ache com quem dividir moradia —&nbsp;sempre
            com outro estudante do outro lado.
          </p>

          {/* A assinatura entra entre o texto e os botões. */}
          <p className="font-mono text-xs text-secondary">
            feito por estudantes, para estudantes
          </p>

          <div className="mt-2 flex flex-wrap gap-3">
            <Button asChild className="rounded-pill px-8 py-6 text-base font-bold">
              <Link href="/cadastro">Criar minha conta</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="rounded-pill border-2 border-secondary px-8 py-6 text-base font-bold text-secondary hover:bg-primary/60 hover:text-primary-foreground"
            >
              <Link href="/entrar">Já tenho conta</Link>
            </Button>
          </div>
        </div>

        <span
          className="absolute -right-24 -bottom-32 size-96 rounded-pill bg-primary/15"
          aria-hidden
        />
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-conteudo">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Quatro jeitos de usar
          </h2>
          <p className="mb-8 text-muted-foreground">
            Tudo num lugar só, entre gente da mesma universidade.
          </p>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIPOS.map(({ Icone, titulo, texto }) => (
              <li key={titulo} className="flex flex-col gap-3 rounded-lg bg-card p-6">
                <Icone className="size-7 text-primary" aria-hidden />
                <h3 className="font-bold text-foreground">{titulo}</h3>
                <p className="text-sm text-foreground/80">{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-card px-6 py-16">
        <div className="mx-auto max-w-conteudo">
          <h2 className="mb-8 text-2xl font-bold text-foreground">Como funciona</h2>

          <ol className="grid gap-8 lg:grid-cols-3">
            {PASSOS.map(({ numero, titulo, texto }) => (
              <li key={numero} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-pill bg-primary text-lg font-bold text-primary-foreground">
                  {numero}
                </span>
                <div>
                  <h3 className="font-bold text-foreground">{titulo}</h3>
                  <p className="mt-1 text-sm text-foreground/80">{texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto flex max-w-conteudo flex-col items-center gap-5 text-center">
          <Zeca pose={2} className="h-40 w-auto text-primary" />
          <h2 className="text-3xl font-bold text-foreground">
            Tem algo parado aí que serve pra alguém?
          </h2>
          <p className="max-w-prose text-muted-foreground">
            Leva menos de cinco minutos para anunciar. E do outro lado tem sempre
            alguém da UFU.
          </p>
          <Button asChild className="rounded-pill px-8 py-6 text-base font-bold">
            <Link href="/cadastro">Começar agora</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
