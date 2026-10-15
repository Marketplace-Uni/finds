import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, ImageOff, MapPin } from "lucide-react";

import { cn } from "@/src/lib/utils";
import { formatPrice } from "@/src/lib/format";
import { Zeca } from "@/src/components/ui/zeca";
import { EstrelaFinds } from "@/src/components/ui/estrela-finds";

export type MatchCandidate = {
  id: string;
  href: string;
  title: string;
  /** Quem anunciou — é com essa pessoa que se vai dividir moradia. */
  personName: string;
  personBio?: string | null;
  price?: number | null;
  priceNote?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  /** Compatibilidade de 0 a 1, como o `matchScore()` devolve. */
  score?: number | null;
  /** Rótulos das tags que as duas pessoas têm em comum. */
  commonTraits?: string[];
  /** Tags que a pessoa tem e você não procura — mostra o contraste. */
  otherTraits?: string[];
};

/** Seta de navegação do deck, no vocabulário dos botões em pílula do Finds. */
function SetaDeck({
  href,
  label,
  desabilitada = false,
  children,
}: {
  href: string;
  label: string;
  desabilitada?: boolean;
  children: ReactNode;
}) {
  const estilo =
    "grid size-10 place-items-center rounded-pill shadow-sm transition-colors [&_svg]:size-5";

  if (desabilitada) {
    return (
      <span
        aria-hidden
        className={cn(estilo, "bg-background/60 text-muted-foreground/40")}
      />
    );
  }

  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        estilo,
        "bg-background text-primary hover:bg-primary/60 hover:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      {children}
    </a>
  );
}

/**
 * Uma tela por candidato, navegando por scroll — o jeito "um de cada vez" do
 * Tinder, mas sem arrastar com o mouse, que no desktop é ruim.
 *
 * O `scroll-snap` faz o navegador encaixar um candidato por vez, então não
 * precisa de JavaScript nem de client component. A foto fica de um lado e a
 * pessoa do outro: aqui o que importa é **com quem** se vai morar, não o
 * imóvel.
 */
export function MatchDeck({
  candidates,
  actionSlot,
  className,
}: {
  candidates: MatchCandidate[];
  /** Botão de contato por candidato, ex.: `<StartChatButton>`. */
  actionSlot?: (candidate: MatchCandidate) => ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        // Sem `scroll-smooth`: o encaixe do snap já é animado pelo navegador, e
        // as duas animações juntas brigavam — era o que deixava o rolar longo
        // travado. `overscroll-contain` impede que o scroll vaze para a página
        // ao chegar no fim da pilha.
        "h-[calc(100svh-8rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain",
        "sem-barra-de-rolagem",
        className,
      )}
      aria-label="Pessoas compatíveis com você"
    >
      {candidates.map((candidate, index) => {
        const pct =
          typeof candidate.score === "number"
            ? Math.round(candidate.score * 100)
            : null;

        return (
          <section
            key={candidate.id}
            id={`match-${index}`}
            className="relative flex h-full snap-start snap-always items-center py-4"
          >
            {/* As setas repetem em cada tela na mesma posição, então parecem
                fixas enquanto a pilha rola. Substituem a barra do navegador,
                que não acompanha a identidade. */}
            <nav
              className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 flex-col gap-2"
              aria-label="Navegar entre as pessoas"
            >
              <SetaDeck
                href={`#match-${index - 1}`}
                label="Pessoa anterior"
                desabilitada={index === 0}
              >
                <ChevronUp aria-hidden />
              </SetaDeck>
              <SetaDeck
                href={`#match-${index + 1}`}
                label={
                  index === candidates.length - 1 ? "Fim da lista" : "Próxima pessoa"
                }
              >
                <ChevronDown aria-hidden />
              </SetaDeck>
            </nav>

            <article className="grid h-full w-full gap-6 overflow-hidden rounded-lg bg-card lg:grid-cols-2">
              <div className="relative min-h-48 bg-muted">
                {candidate.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div
                    className="grid size-full place-items-center text-muted-foreground"
                    aria-hidden
                  >
                    <ImageOff className="size-10" />
                  </div>
                )}

                {/* A estrela fica ao lado do número, não atrás: as pontas são
                    finas e o texto escrito dentro dela transbordava. Fundo
                    claro, estrela laranja e escrita em marrom (Lia, 14/10). */}
                {pct !== null ? (
                  <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-background px-3 py-2.5 shadow-sm">
                    <EstrelaFinds className="h-9 w-auto shrink-0 text-primary" />
                    {/* Centralizado: "compatível" é mais largo que o número, e
                        alinhados à esquerda a coluna ficava torta. */}
                    <div className="flex flex-col items-center leading-none text-foreground">
                      <span className="text-2xl font-bold">{`${pct}%`}</span>
                      <span className="-mt-0.5 text-[11px] font-semibold">
                        compatível
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col justify-center gap-4 p-6 lg:p-8">
                <header className="flex flex-col gap-1">
                  <h2 className="text-2xl leading-tight font-bold text-foreground">
                    {candidate.personName}
                  </h2>
                  <p className="text-sm text-foreground">{candidate.title}</p>
                  {candidate.location ? (
                    <p className="flex items-center gap-1 text-sm text-primary">
                      <MapPin className="size-4" aria-hidden />
                      {candidate.location}
                    </p>
                  ) : null}
                </header>

                {candidate.personBio ? (
                  <p className="text-sm leading-relaxed text-foreground/80">
                    {candidate.personBio}
                  </p>
                ) : null}

                {candidate.commonTraits && candidate.commonTraits.length > 0 ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      Vocês dois
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {candidate.commonTraits.map((trait) => (
                        <li
                          key={trait}
                          className="rounded-pill bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
                        >
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {candidate.otherTraits && candidate.otherTraits.length > 0 ? (
                  <section>
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      Também é
                    </h3>
                    <ul className="flex flex-wrap gap-2">
                      {candidate.otherTraits.map((trait) => (
                        <li
                          key={trait}
                          className="rounded-pill bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground"
                        >
                          {trait}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {typeof candidate.price === "number" ? (
                  <p className="text-lg font-bold text-foreground">
                    {formatPrice(candidate.price)}
                    {candidate.priceNote ? (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        {candidate.priceNote}
                      </span>
                    ) : null}
                  </p>
                ) : null}

                <div className="mt-1 flex flex-wrap items-center gap-3">
                  {actionSlot?.(candidate)}
                  <Link
                    href={candidate.href}
                    className="rounded-pill px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Ver anúncio
                  </Link>
                </div>

                {/* O link de "próxima" saiu: as setas ao lado fazem isso. */}
                <footer className="mt-2 text-xs text-muted-foreground">
                  {`${index + 1} de ${candidates.length}`}
                </footer>
              </div>
            </article>
          </section>
        );
      })}

      {/* Fim da pilha: sem isto a última pessoa parece um erro de carregamento. */}
      <section className="flex h-full snap-start snap-always flex-col items-center justify-center gap-4 text-center">
        <Zeca pose={5} className="h-32 w-auto text-primary" />
        <p className="text-lg font-bold text-foreground">
          Por enquanto é isso
        </p>
        <p className="max-w-prose text-sm text-muted-foreground">
          Volte depois: conforme mais gente monta o perfil de convivência, novas
          pessoas compatíveis aparecem aqui.
        </p>
      </section>
    </div>
  );
}
