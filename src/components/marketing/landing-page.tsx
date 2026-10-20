import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { Zeca } from "@/src/components/ui/zeca";
import { ZecaCarrossel } from "@/src/components/ui/zeca-carrossel";
import { TIPOS_ANUNCIO, HOVER_CLASSES_POR_TOKEN } from "@/src/components/listings/tipos-anuncio";
import { LandingScrollFx } from "@/src/components/marketing/landing-scroll-fx";
import { cn } from "@/src/lib/utils";

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
      {/*
        Full-bleed: o layout logado (src/app/(main)/layout.tsx) centraliza o
        conteúdo num <main max-w-conteudo>, o que também apertava a landing
        do visitante. `left-1/2 -mx-[50vw] w-screen` estoura essa largura e
        deixa o retângulo marrom ocupando a tela inteira; o conteúdo interno
        (abaixo) continua com seu próprio `max-w-conteudo`. O `-mt-8` cancela
        o `py-8` desse mesmo `<main>` (fixo, igual em toda tela logada) pra
        colar o marrom na navbar, sem tirar o respiro das outras páginas.

        O truque de margem negativa fica neste `<div>` de fora, não na
        `<section id="landing-hero">`: o GSAP ScrollTrigger pina essa section
        (ver landing-scroll-fx.tsx), e margem no elemento pinado faz o cálculo
        da altura do "spacer" sair errado (o scroll parava de avançar depois
        do pin, escondendo as seções de baixo atrás da section "presa").
      */}
      <div className="relative left-1/2 -mt-8 w-screen -mx-[50vw]">
      <section
        id="landing-hero"
        className="relative overflow-hidden bg-nav px-6 py-20"
      >
        <LandingScrollFx />
        {/*
          O Zeca volta aqui a pedido do Guilherme (18/10) — a Lia tinha
          pedido pra tirar o mascote desse tipo de painel em 14/10 (ver
          docs/DESIGN.md). Vale confirmar com ela/o Caike no próximo
          checkpoint.
        */}
        <div
          data-hero-content
          className="relative z-10 mx-auto flex max-w-conteudo flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="flex flex-col items-start gap-5">
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

          <ZecaCarrossel
            poses={[1, 2, 4, 3, 7]}
            boxClassName="hidden h-72 w-72 shrink-0 lg:block"
            zecaClassName="h-64 w-auto text-secondary"
          />
        </div>

        <span
          className="absolute -right-24 -bottom-32 size-96 rounded-pill bg-primary/15"
          aria-hidden
        />
      </section>
      </div>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-conteudo">
          <h2 className="mb-2 text-2xl font-bold text-foreground">
            Quatro jeitos de usar
          </h2>
          <p className="mb-8 text-muted-foreground">
            Tudo num lugar só, entre gente da mesma universidade.
          </p>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIPOS_ANUNCIO.map(({ slug, titulo, texto, Icone, token }) => (
              <li key={slug}>
                <Link
                  href={`/como-funciona/${slug}`}
                  className={cn(
                    "group flex h-full flex-col gap-3 rounded-lg bg-card p-6 transition-all duration-300 hover:scale-105 hover:shadow-md",
                    HOVER_CLASSES_POR_TOKEN[token],
                  )}
                >
                  <Icone className="size-7 text-primary transition-colors group-hover:text-current" aria-hidden />
                  <h3 className="font-bold text-foreground transition-colors group-hover:text-current">
                    {titulo}
                  </h3>
                  <p className="text-sm text-foreground/80 transition-colors group-hover:text-current">
                    {texto}
                  </p>
                </Link>
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
