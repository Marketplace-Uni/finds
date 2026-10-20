"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Efeito de "foco" ao rolar pelas 3 seções de "Como funciona" da landing:
 * cada `[data-como-funciona-step]` nasce um pouco apagada e menor, ganha
 * foco total (opacidade e escala plenas) quando cruza o centro da tela, e
 * volta a apagar conforme sai de cena — sem pinar nada (ao contrário do
 * efeito do hero, ver `landing-scroll-fx.tsx`), então não herda o cuidado
 * com `pin-spacer`/margem daquele componente.
 *
 * Só roda em telas grandes e nunca se `prefers-reduced-motion` estiver
 * ativo — no mobile as 3 seções aparecem sempre com foco total, sem
 * depender de JS nenhum (mesmo padrão do resto da landing).
 */
export function ComoFuncionaFx() {
  useEffect(() => {
    const passos = document.querySelectorAll<HTMLElement>("[data-como-funciona-step]");
    if (passos.length === 0) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add(
      { ativo: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      () => {
        const timelines = Array.from(passos).map((passo) =>
          gsap
            .timeline({
              scrollTrigger: {
                trigger: passo,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            })
            // Primeira metade da passagem: ganha foco ao se aproximar do
            // centro da tela. Segunda metade: perde foco ao se afastar —
            // os dois tweens na mesma timeline criam o "pico" de foco
            // exatamente quando a seção está centralizada na tela.
            .fromTo(passo, { autoAlpha: 0.35, scale: 0.92 }, { autoAlpha: 1, scale: 1, ease: "none" }, 0)
            .to(passo, { autoAlpha: 0.35, scale: 0.92, ease: "none" }, 0.5),
        );

        return () => {
          for (const tl of timelines) tl.kill();
        };
      },
    );

    return () => {
      mm.revert();
      // Mesmo cuidado do `landing-scroll-fx.tsx`: garante que nenhuma seção
      // fica presa apagada se o componente desmontar no meio de uma
      // transição (navegação pra outra rota com o scroll parado a meio
      // caminho de um dos passos).
      gsap.killTweensOf(passos);
      gsap.set(passos, { clearProps: "all" });
    };
  }, []);

  return null;
}
