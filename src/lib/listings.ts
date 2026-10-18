import { createClient } from "@/src/lib/supabase/server";
import { TYPE_OPTIONS, type FilterOption } from "@/src/components/discovery/filters-sidebar";
import { LISTING_TYPE_BY_FILTER_VALUE, type ListingFilters } from "@/src/lib/listings-filters";
import { productDetailsSchema, serviceDetailsSchema } from "@/src/lib/validations/listings";
import type { Database, Json } from "@/src/types/database";
import type { ListingType } from "@/src/lib/listing-details";

export const LISTINGS_PAGE_SIZE = 12;

/**
 * Categorias de produto + serviço (únicas opções que têm `category` em
 * `details`), extraídas dos schemas do Josué pra não duplicar a lista à mão.
 * Alimenta o fieldset "Categoria" do `<FiltersSidebar>`, que antes ficava
 * escondido por não receber `categories` (ver PENDENCIAS-KAIKE.md).
 */
export const CATEGORY_OPTIONS: FilterOption[] = [
  ...new Set([
    ...productDetailsSchema.shape.category.unwrap().options,
    ...serviceDetailsSchema.shape.category.unwrap().options,
  ]),
]
  .sort()
  .map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }));

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

/** Todas as fotos do anúncio (não só a capa), ordenadas, para a galeria do detalhe. */
function imageUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  images: ImageRow[] | null | undefined,
): { url: string }[] {
  return [...(images ?? [])]
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
    .map((image) => ({
      url: supabase.storage.from("listing-images").getPublicUrl(image.path).data.publicUrl,
    }));
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
 * Busca anúncios ativos para o feed e a busca, aplicando os filtros da URL,
 * incluindo `categoria`/`condicao` (dentro de `listings.details`, jsonb).
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

  // `categoria`/`condicao` vivem em `details` (jsonb): filtrar pelo valor de
  // texto extraído com `->>`, suportado pelo PostgREST. Só produto/serviço
  // têm `category`, e só produto tem `condition` — os outros tipos nunca
  // batem, o que é o comportamento certo ao aplicar esses filtros.
  if (filters.categoria.length > 0) query = query.in("details->>category", filters.categoria);
  if (filters.condicao.length > 0) query = query.in("details->>condition", filters.condicao);

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

/** Nome e bio de donos de anúncio, em lote, para o `<MatchDeck>` em `/roommates`. */
export async function fetchOwnerProfiles(
  ownerIds: string[],
): Promise<Map<string, { name: string; bio: string | null }>> {
  const map = new Map<string, { name: string; bio: string | null }>();
  const uniqueIds = [...new Set(ownerIds)];
  if (uniqueIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, bio")
    .in("id", uniqueIds);
  if (error) throw error;

  for (const row of data ?? []) {
    map.set(row.id, { name: row.full_name ?? row.username ?? "Sem nome", bio: row.bio ?? null });
  }
  return map;
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

export type OwnerListingSummary = ListingSummary & {
  status: Database["public"]["Enums"]["listing_status"];
};

/** Todos os anúncios do dono (qualquer status), para `/meus-anuncios`. */
export async function fetchOwnerListings(ownerId: string): Promise<OwnerListingSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, title, price, type, status, campuses(name), listing_images(path, position)")
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
    status: row.status,
  }));
}

export type ListingDetailSeller = {
  username: string;
  name: string;
  avatarUrl: string | null;
  lastSeenAt: string | null;
};

export type ListingDetailData = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  price: number | null;
  type: ListingType;
  status: Database["public"]["Enums"]["listing_status"];
  details: Json | null;
  images: { url: string }[];
  seller: ListingDetailSeller;
};

/**
 * Busca um anúncio pelo id para a página `/anuncios/[id]`, com todas as fotos
 * e os dados do anunciante. `null` quando o anúncio não existe ou a RLS o
 * esconde (ex.: rascunho/pausado de outra pessoa) — a página trata os dois
 * casos como "não encontrado".
 */
export async function fetchListingDetail(id: string): Promise<ListingDetailData | null> {
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      "id, owner_id, title, description, price, type, status, details, listing_images(path, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!listing) return null;

  const { data: owner, error: ownerError } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url, last_seen_at")
    .eq("id", listing.owner_id)
    .maybeSingle();
  if (ownerError) throw ownerError;

  return {
    id: listing.id,
    ownerId: listing.owner_id,
    title: listing.title,
    description: listing.description ?? "",
    price: listing.price,
    type: listing.type,
    status: listing.status,
    details: listing.details,
    images: imageUrls(supabase, listing.listing_images),
    seller: {
      username: owner?.username ?? "",
      name: owner?.full_name ?? owner?.username ?? "Sem nome",
      avatarUrl: owner?.avatar_url ?? null,
      lastSeenAt: owner?.last_seen_at ?? null,
    },
  };
}
