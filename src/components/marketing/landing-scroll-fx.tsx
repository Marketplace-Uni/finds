"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Efeito de scroll só da landing (visitante deslogado em `/`): a logo
 * "finds" começa centralizada na navbar, sem os botões de Entrar/Criar
 * conta. Ao rolar a página, ela "some" da navbar enquanto o hero (texto +
 * mascote) aparece em tamanho real — como se o texto tivesse se deslocado
 * pra lá. Depois que o hero passa, a navbar (já `sticky`, ver navbar.tsx)
 * mostra a logo de novo e os botões de Entrar/Criar conta, no canto
 * direito.
 *
 * Só roda em telas grandes (`min-width: 1024px`) e nunca se
 * `prefers-reduced-motion` estiver ativo — fora disso a navbar funciona do
 * jeito de sempre (logo à esquerda, botões à direita, sem depender de JS
 * nenhum). Isso não é client component dentro do `<Navbar>` (que é do
 * Caike): este componente só lê o DOM dele por `data-*` attrs, renderizado
 * só dentro do hero da landing, então o Navbar nem sabe que esse efeito
 * existe.
 */
export function LandingScrollFx() {
  useEffect(() => {
    const hero = document.getElementById("landing-hero");
    const heroContent = hero?.querySelector<HTMLElement>("[data-hero-content]");
    const navbarRow = document.querySelector<HTMLElement>("[data-navbar-row]");
    const navbarBrand = document.querySelector<HTMLElement>("[data-navbar-brand]");
    const guestActions = document.querySelector<HTMLElement>("[data-navbar-guest-actions]");

    if (!hero || !heroContent || !navbarRow || !navbarBrand || !guestActions) return;

    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    // `onEnter`/`onLeaveBack` disparam `gsap.to(...)` de forma assíncrona (em
    // resposta ao scroll), fora do corpo síncrono do `mm.add()` — o
    // matchMedia do GSAP só rastreia (pra reverter sozinho) o que é criado
    // de forma síncrona ali dentro, então esses tweens não entram no
    // `mm.revert()`. Sem essa flag, navegar pra outra rota bem no meio de
    // uma dessas transições (0.2-0.3s) podia deixar os botões de
    // Entrar/Criar conta escondidos na navbar — que é compartilhada entre
    // todas as páginas — até um refresh manual.
    let active = true;

    mm.add(
      { ativo: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)" },
      () => {
        // Estado inicial: só a logo, centralizada, sem os botões — "width: 0"
        // além da opacidade porque senão o espaço reservado pros botões
        // continuaria empurrando a logo pra esquerda em vez de centralizar.
        gsap.set(guestActions, { autoAlpha: 0, width: 0, overflow: "hidden" });
        navbarRow.classList.add("justify-center");

        gsap.set(heroContent, { autoAlpha: 0, scale: 0.85, transformOrigin: "center center" });

        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            // Valor em pixels (não "+=60%"): evita ambiguidade de a
            // porcentagem ser lida contra a altura do documento inteiro em
            // vez da viewport, o que fixava o hero por quase toda a rolagem
            // da página e escondia "Quatro jeitos de usar"/"Como funciona"
            // atrás dele.
            end: "+=600",
            scrub: true,
            pin: true,
            anticipatePin: 1,
          },
        });
        pinTl.to(navbarBrand, { autoAlpha: 0, duration: 1 }, 0);
        pinTl.to(heroContent, { autoAlpha: 1, scale: 1, duration: 1 }, 0);

        const afterHero = ScrollTrigger.create({
          trigger: hero,
          start: "bottom top",
          onEnter: () => {
            if (!active) return;
            navbarRow.classList.remove("justify-center");
            gsap.to(navbarBrand, { autoAlpha: 1, duration: 0.3 });
            gsap.to(guestActions, { autoAlpha: 1, width: "auto", overflow: "visible", duration: 0.3 });
          },
          onLeaveBack: () => {
            if (!active) return;
            navbarRow.classList.add("justify-center");
            gsap.to(navbarBrand, { autoAlpha: 0, duration: 0.2 });
            gsap.to(guestActions, { autoAlpha: 0, width: 0, overflow: "hidden", duration: 0.2 });
          },
        });

        return () => {
          afterHero.kill();
        };
      },
    );

    return () => {
      active = false;
      mm.revert();
      // Garante que a navbar (compartilhada entre páginas) nunca fica presa
      // num estado escondido por causa de um tween que já estava em
      // andamento quando este componente desmontou (ver comentário acima).
      gsap.killTweensOf([navbarBrand, guestActions]);
      // `clearProps` tira todo estilo inline que o GSAP aplicou, voltando
      // pro visual padrão (sempre visível) definido pelas classes do Tailwind.
      gsap.set([navbarBrand, guestActions], { clearProps: "all" });
      navbarRow.classList.remove("justify-center");
    };
  }, []);

  return null;
}
