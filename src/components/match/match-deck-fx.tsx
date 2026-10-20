"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Efeito de "scroll expand" do deck de match: o card de cada pessoa nasce um
 * pouco menor e apagado, e "expande" pra escala/opacidade plenas conforme
 * ocupa o centro do deck — o mesmo raciocínio do `ComoFuncionaFx` da landing,
 * só que rastreando o scroll de dentro do próprio deck (`[data-match-deck]`,
 * que tem sua própria barra — `overflow-y-auto` — em vez do scroll da
 * página), por isso cada ScrollTrigger aqui precisa de `scroller` apontando
 * pra esse elemento.
 *
 * Só roda em telas grandes e nunca com `prefers-reduced-motion` — no celular
 * (e com o requisito de acessibilidade) os cards aparecem sempre em foco
 * total, sem depender de JS. O que de fato resolve "o scroll muda de pessoa
 * cedo demais" é só CSS, no próprio `match-deck.tsx` (snap por proximidade
 * em vez de obrigatório, e altura mínima em vez de fixa — ver o comentário
 * lá); isto aqui é só o acabamento visual, puramente aditivo.
 */
export function MatchDeckFx() {
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>("[data-match-deck]");
    const cards = document.querySelectorAll<HTMLElement>("[data-match-card]");
    if (!scroller || cards.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      { ativo: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      () => {
        const timelines = Array.from(cards).map((card) =>
          gsap
            .timeline({
              scrollTrigger: {
                trigger: card,
                scroller,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
            .fromTo(card, { autoAlpha: 0.5, scale: 0.94 }, { autoAlpha: 1, scale: 1, ease: "none" }, 0)
            .to(card, { autoAlpha: 0.5, scale: 0.94, ease: "none" }, 0.5),
        );

        return () => {
          for (const tl of timelines) tl.kill();
        };
      },
    );

    return () => {
      mm.revert();
      gsap.killTweensOf(cards);
      gsap.set(cards, { clearProps: "all" });
    };
  }, []);

  return null;
}
