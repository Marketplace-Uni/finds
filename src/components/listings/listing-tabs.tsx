import Link from "next/link";

import { cn } from "@/src/lib/utils";

export type ListingTab = {
  /** Valor que vai para a URL, ex.: "ativos". */
  value: string;
  label: string;
  /** Mostrado ao lado do rótulo quando houver. */
  count?: number;
};

/**
 * Abas de "Meus anúncios": Ativos, Rascunhos, Encerrados.
 *
 * São **links**, não botões com estado: a aba atual fica na URL
 * (`/meus-anuncios?aba=rascunhos`), então funciona sem JavaScript e dá para
 * compartilhar o endereço. Quem é dono da rota lê o searchParam e filtra.
 */
export function ListingTabs({
  tabs,
  current,
  basePath = "/meus-anuncios",
  param = "aba",
  className,
}: {
  tabs: ListingTab[];
  current: string;
  basePath?: string;
  param?: string;
  className?: string;
}) {
  return (
    <nav className={cn("border-b border-border", className)} aria-label="Meus anúncios">
      <ul className="flex flex-wrap gap-1">
        {tabs.map((tab) => {
          const ativa = tab.value === current;
          return (
            <li key={tab.value}>
              <Link
                href={`${basePath}?${param}=${tab.value}`}
                aria-current={ativa ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                  ativa
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
                {typeof tab.count === "number" ? (
                  <span
                    className={cn(
                      "rounded-pill px-2 py-0.5 text-xs",
                      ativa
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
