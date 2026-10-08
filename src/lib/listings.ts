import { createClient } from "@/src/lib/supabase/server";
import { TYPE_OPTIONS, type FilterOption } from "@/src/components/discovery/filters-sidebar";
import { LISTING_TYPE_BY_FILTER_VALUE, type ListingFilters } from "@/src/lib/listings-filters";

export const LISTINGS_PAGE_SIZE = 12;

export type ListingSummary = {
  id: string;
  title: string;
  price: number | null;
  location: string | null;
  typeLabel: string | null;
  imageUrl: string | null;
};

const FILTER_VALUE_BY_DB_TYPE: Record<string, string> = Object.fromEntries(
  Object.entries(LISTING_TYPE_BY_FILTER_VALUE).map(([filterValue, dbType]) => [
    dbType,
    filterValue,
  ]),
);

const TYPE_LABEL_BY_FILTER_VALUE: Record<string, string> = Object.fromEntries(
  TYPE_OPTIONS.map((option) => [option.value, option.label]),
);

function typeLabel(dbType: string): string | null {
  const filterValue = FILTER_VALUE_BY_DB_TYPE[dbType];
  return filterValue ? (TYPE_LABEL_BY_FILTER_VALUE[filterValue] ?? null) : null;
}

type ImageRow = { path: string; position: number | null };

function coverImageUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: ImageRow[] | null | undefined,
): string | null {
  const capa = [...(images ?? [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0))[0];
  return capa ? supabase.storage.from("listing-images").getPublicUrl(capa.path).data.publicUrl : null;
}

// Sem o Database tipado em lib/supabase/server.ts, o embed 1:1 (ex.: listing
// -> 1 campus) volta tipado como array mesmo sendo um registro só.
function campusName(campuses: { name: string } | { name: string }[] | null | undefined) {
  const campus = Array.isArray(campuses) ? campuses[0] : campuses;
  return campus?.name ?? null;
}

/** Campus reais do banco, no formato que o `<FiltersSidebar>` espera. */
export async function fetchCampusOptions(): Promise<FilterOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("campuses").select("id, name").order("name");
  if (error) throw error;
  return (data ?? []).map((campus) => ({ value: campus.id, label: campus.name }));
}

/**
 * Busca anúncios ativos para o feed e a busca, aplicando os filtros da URL.
 *
 * `categoria` e `condicao` ainda não são filtráveis: vivem dentro de
 * `listings.details` (JSONB), cujo formato por tipo de anúncio é entrega do
 * Josué (Sprint 1 dele) e ainda não existe em nenhuma branch — o filtro fica
 * só na URL/UI por enquanto, sem efeito na query.
 */
export async function fetchListings(filters: ListingFilters, page: number) {
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("id, title, price, type, campuses(name), listing_images(path, position)", {
      count: "exact",
    })
    .eq("status", "active");

  const dbTypes = filters.tipo
    .map((value) => LISTING_TYPE_BY_FILTER_VALUE[value])
    .filter((value): value is string => Boolean(value));
  if (dbTypes.length > 0) query = query.in("type", dbTypes);

  if (filters.campus) query = query.eq("campus_id", filters.campus);
  if (filters.precoMin !== null) query = query.gte("price", filters.precoMin);
  if (filters.precoMax !== null) query = query.lte("price", filters.precoMax);

  if (filters.q) {
    const termo = filters.q.replace(/[%,]/g, " ").trim();
    if (termo) query = query.or(`title.ilike.%${termo}%,description.ilike.%${termo}%`);
  }

  if (filters.ordem === "menor-preco") {
    query = query.order("price", { ascending: true, nullsFirst: false });
  } else if (filters.ordem === "maior-preco") {
    query = query.order("price", { ascending: false, nullsFirst: false });
  } else {
    // "relevantes" cai pra recentes: sem rank de busca textual ainda.
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(0, page * LISTINGS_PAGE_SIZE - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  const listings: ListingSummary[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price,
    location: campusName(row.campuses),
    typeLabel: typeLabel(row.type),
    imageUrl: coverImageUrl(supabase, row.listing_images),
  }));

  const total = count ?? listings.length;
  return { listings, total, hasMore: total > page * LISTINGS_PAGE_SIZE };
}

export type RoommateListingSummary = {
  id: string;
  title: string;
  price: number | null;
  location: string | null;
  imageUrl: string | null;
  ownerId: string;
};

/**
 * Anúncios ativos de roommate/república, para `/roommates`. Sem paginação
 * nem filtro de preço/categoria: o volume da demo é pequeno e a ordenação
 * final é pelo score de match, calculado em memória (ARQUITETURA.md).
 */
export async function fetchRoommateListings(): Promise<RoommateListingSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, title, price, owner_id, campuses(name), listing_images(path, position)")
    .eq("status", "active")
    .in("type", ["roommate", "republic"])
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price,
    location: campusName(row.campuses),
    imageUrl: coverImageUrl(supabase, row.listing_images),
    ownerId: row.owner_id,
  }));
}

/** Anúncios ativos de um usuário, para o grid em `/perfil/[username]`. */
export async function fetchUserListings(ownerId: string): Promise<ListingSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, title, price, type, campuses(name), listing_images(path, position)")
    .eq("status", "active")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    price: row.price,
    location: campusName(row.campuses),
    typeLabel: typeLabel(row.type),
    imageUrl: coverImageUrl(supabase, row.listing_images),
  }));
}
