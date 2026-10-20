import { Handshake, House, ShoppingBag, Wrench, type LucideIcon } from "lucide-react";

import type { ListingType } from "@/src/lib/listing-details";

export type TokenMarca = "primary" | "secondary" | "accent" | "nav";

/**
 * Classes Tailwind por token, escritas por extenso (não construídas com
 * template string) — o scanner do Tailwind precisa ver o nome da classe
 * literal no código-fonte pra incluir no CSS final.
 */
export const CLASSES_POR_TOKEN: Record<TokenMarca, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
  nav: "bg-nav text-nav-foreground",
};

/**
 * Mesma cor, só que como `hover:` — para um elemento que é, ele mesmo, o alvo
 * do hover (`group-hover:` exigiria um ANCESTRAL com `.group`, não o próprio
 * elemento hover: `.group:hover .group-hover\:bg-x` nunca bate quando as duas
 * classes estão no mesmo nó).
 */
export const HOVER_CLASSES_POR_TOKEN: Record<TokenMarca, string> = {
  primary: "hover:bg-primary hover:text-primary-foreground",
  secondary: "hover:bg-secondary hover:text-secondary-foreground",
  accent: "hover:bg-accent hover:text-accent-foreground",
  nav: "hover:bg-nav hover:text-nav-foreground",
};

export type TipoAnuncio = {
  type: ListingType;
  /** Trecho da URL em `/anunciar/<slug>` e `/como-funciona/<slug>`. */
  slug: "produto" | "servico" | "roommate" | "republica";
  titulo: string;
  /** Igual ao `label` de `TYPE_OPTIONS` (filters-sidebar) — pro chip do tipo. */
  tituloSingular: string;
  texto: string;
  Icone: LucideIcon;
  /** Token do tema usado pra cor do card/chip deste tipo. */
  token: TokenMarca;
};

/**
 * Os 4 tipos de anúncio do Finds — ícone, texto e cor da marca num só lugar,
 * reaproveitado por `/anunciar`, pela landing ("Quatro jeitos de usar") e
 * pelas páginas `/como-funciona/<tipo>`, pra não repetir a mesma lista 3
 * vezes com o risco de ficarem dessincronizadas.
 */
export const TIPOS_ANUNCIO: TipoAnuncio[] = [
  {
    type: "product",
    slug: "produto",
    titulo: "Produtos",
    tituloSingular: "Produto",
    texto: "Da calculadora que você não usa mais ao móvel que não cabe na mudança.",
    Icone: ShoppingBag,
    token: "primary",
  },
  {
    type: "service",
    slug: "servico",
    titulo: "Serviços",
    tituloSingular: "Serviço",
    texto: "Aula particular, conserto, design, frete. Quem faz bem está do seu lado.",
    Icone: Wrench,
    token: "secondary",
  },
  {
    type: "roommate",
    slug: "roommate",
    titulo: "Roommates",
    tituloSingular: "Roommate",
    texto: "Ache alguém para dividir moradia com a rotina parecida com a sua.",
    Icone: Handshake,
    token: "accent",
  },
  {
    type: "republic",
    slug: "republica",
    titulo: "Repúblicas",
    tituloSingular: "República",
    texto: "Vagas perto do campus, anunciadas por quem já mora lá.",
    Icone: House,
    token: "nav",
  },
];
