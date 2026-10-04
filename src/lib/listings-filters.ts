/**
 * Lê os filtros do feed e da busca a partir dos `searchParams` do Next
 * (App Router), no mesmo vocabulário que o <FiltersSidebar> já usa para
 * montar o formulário GET: q, tipo, categoria, campus, condicao,
 * preco_min, preco_max, ordem.
 */
export type ListingSearchParams = Record<string, string | string[] | undefined>;

export type ListingFilters = {
  q: string | null;
  tipo: string[];
  categoria: string[];
  campus: string | null;
  condicao: string[];
  precoMin: number | null;
  precoMax: number | null;
  ordem: string;
};

/** Valor padrão de ordenação, o mesmo que o <FiltersSidebar> assume. */
export const DEFAULT_ORDER = "recentes";

/**
 * Tipo do chip (Figma/UI, em português) → enum `listing_type` do banco.
 * Necessário porque a coluna usa inglês (ARQUITETURA.md) e o formulário
 * usa os valores em português.
 */
export const LISTING_TYPE_BY_FILTER_VALUE: Record<string, string> = {
  produto: "product",
  servico: "service",
  roommate: "roommate",
  republica: "republic",
};

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value.filter(Boolean) : [value].filter(Boolean);
}

function toSingle(value: string | string[] | undefined): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  return first ? first : null;
}

function toNumber(value: string | string[] | undefined): number | null {
  const raw = toSingle(value);
  if (raw === null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseListingFilters(searchParams: ListingSearchParams): ListingFilters {
  return {
    q: toSingle(searchParams.q),
    tipo: toArray(searchParams.tipo),
    categoria: toArray(searchParams.categoria),
    campus: toSingle(searchParams.campus),
    condicao: toArray(searchParams.condicao),
    precoMin: toNumber(searchParams.preco_min),
    precoMax: toNumber(searchParams.preco_max),
    ordem: toSingle(searchParams.ordem) ?? DEFAULT_ORDER,
  };
}

/** Página atual do "carregar mais" (`?pagina=`), nunca menor que 1. */
export function parsePage(searchParams: ListingSearchParams): number {
  const parsed = toNumber(searchParams.pagina);
  return parsed && parsed > 1 ? Math.floor(parsed) : 1;
}

/**
 * Monta o link de "carregar mais": preserva todos os filtros da URL atual e
 * só troca (ou adiciona) `pagina`. Sem JavaScript — é só um `<a href>`.
 */
export function buildListingsHref(
  path: string,
  searchParams: ListingSearchParams,
  page: number,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "pagina") continue;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else if (value) {
      params.set(key, value);
    }
  }

  if (page > 1) params.set("pagina", String(page));

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
