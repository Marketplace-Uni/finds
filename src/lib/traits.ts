import { createClient } from "@/src/lib/supabase/server";
import type { Trait } from "@/src/components/match/convivencia-picker";
import type { UserTraits } from "@/src/lib/match";

/** Todas as tags fixas de convivência, para o `<ConvivenciaPicker>`. */
export async function fetchTraits(): Promise<Trait[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("traits")
    .select("key, label, trait_group")
    .order("trait_group")
    .order("label");
  if (error) throw error;

  return (data ?? []).map((trait) => ({
    key: trait.key,
    label: trait.label,
    group: trait.trait_group,
  }));
}

/** `trait.key -> trait.label`, pra traduzir keys em rótulos (ex.: `commonTraits` do `<MatchCard>`). */
export async function fetchTraitLabels(): Promise<Map<string, string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("traits").select("key, label");
  if (error) throw error;
  return new Map((data ?? []).map((trait) => [trait.key, trait.label]));
}

type TraitEmbed = { key: string } | { key: string }[] | null;

function traitKey(embed: TraitEmbed): string | null {
  const trait = Array.isArray(embed) ? embed[0] : embed;
  return trait?.key ?? null;
}

/** Tags self/wanted (em `trait.key`) de um usuário, no formato que `<ConvivenciaPicker>`/`match.ts` esperam. */
export async function fetchUserTraits(userId: string): Promise<UserTraits> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_traits")
    .select("kind, traits(key)")
    .eq("user_id", userId);
  if (error) throw error;

  const self = new Set<string>();
  const wanted = new Set<string>();
  for (const row of data ?? []) {
    const key = traitKey(row.traits);
    if (!key) continue;
    (row.kind === "wanted" ? wanted : self).add(key);
  }

  return { self, wanted };
}

/** `fetchUserTraits` em lote, pra não fazer N+1 ao calcular o score de várias listings. */
export async function fetchUserTraitsBulk(userIds: string[]): Promise<Map<string, UserTraits>> {
  const map = new Map<string, UserTraits>();
  const uniqueIds = [...new Set(userIds)];
  for (const id of uniqueIds) map.set(id, { self: new Set(), wanted: new Set() });
  if (uniqueIds.length === 0) return map;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_traits")
    .select("user_id, kind, traits(key)")
    .in("user_id", uniqueIds);
  if (error) throw error;

  for (const row of data ?? []) {
    const key = traitKey(row.traits);
    const entry = map.get(row.user_id);
    if (!key || !entry) continue;
    (row.kind === "wanted" ? entry.wanted : entry.self).add(key);
  }

  return map;
}

/**
 * Substitui o conjunto de `user_traits` do usuário pelas keys recebidas do
 * `<ConvivenciaPicker>`. A PK na migration é `(user_id, trait_id, kind)` —
 * três colunas, não duas: ela permite a mesma trait existir como "self" E
 * "wanted" ao mesmo tempo. A regra de negócio é "uma trait só pode ser 'sou'
 * OU 'procuro' por vez" (se a mesma key vier nos dois grupos, não deveria,
 * mas o form é só HTML — "procuro" tem prioridade); por isso o código, não o
 * banco, garante isso aqui.
 *
 * Grava a lista nova antes de apagar o que ficou de fora (mesmo padrão
 * usado em `updateListing()` pras fotos: se o passo de gravação falhar por
 * algo transitório, a pessoa não perde o perfil de convivência inteiro, só
 * a tentativa de salvar). O `onConflict` do upsert precisa bater exatamente
 * com a PK real (`user_id,trait_id,kind`); como ela inclui `kind`, trocar
 * uma trait de grupo não é "atualizada" pelo upsert — a linha do grupo
 * antigo fica sobrando e é removida depois, junto com o que não faz mais
 * parte da seleção.
 */
export async function saveUserTraits(
  userId: string,
  selection: { sou: string[]; procuro: string[] },
): Promise<void> {
  const supabase = await createClient();
  const keys = [...new Set([...selection.sou, ...selection.procuro])];

  const { data: traitRows, error: lookupError } =
    keys.length > 0
      ? await supabase.from("traits").select("id, key").in("key", keys)
      : { data: [] as { id: string; key: string }[], error: null };
  if (lookupError) throw lookupError;

  const idByKey = new Map((traitRows ?? []).map((trait) => [trait.key, trait.id]));

  const rows: { user_id: string; trait_id: string; kind: "self" | "wanted" }[] = [];
  const kindByTraitId = new Map<string, "self" | "wanted">();

  for (const key of selection.procuro) {
    const traitId = idByKey.get(key);
    if (!traitId || kindByTraitId.has(traitId)) continue;
    kindByTraitId.set(traitId, "wanted");
    rows.push({ user_id: userId, trait_id: traitId, kind: "wanted" });
  }
  for (const key of selection.sou) {
    const traitId = idByKey.get(key);
    if (!traitId || kindByTraitId.has(traitId)) continue;
    kindByTraitId.set(traitId, "self");
    rows.push({ user_id: userId, trait_id: traitId, kind: "self" });
  }

  const { data: currentRows, error: currentError } = await supabase
    .from("user_traits")
    .select("trait_id, kind")
    .eq("user_id", userId);
  if (currentError) throw currentError;

  if (rows.length > 0) {
    const { error: upsertError } = await supabase
      .from("user_traits")
      .upsert(rows, { onConflict: "user_id,trait_id,kind" });
    if (upsertError) throw upsertError;
  }

  // Sobra do que não faz mais parte da seleção, e da versão antiga (outro
  // `kind`) de uma trait que trocou de grupo — o upsert acima não some com
  // ela sozinho porque `kind` faz parte da PK.
  const staleRows = (currentRows ?? []).filter(
    (row) => kindByTraitId.get(row.trait_id) !== row.kind,
  );

  for (const kind of ["self", "wanted"] as const) {
    const traitIds = staleRows.filter((row) => row.kind === kind).map((row) => row.trait_id);
    if (traitIds.length === 0) continue;

    const { error: deleteError } = await supabase
      .from("user_traits")
      .delete()
      .eq("user_id", userId)
      .eq("kind", kind)
      .in("trait_id", traitIds);
    if (deleteError) throw deleteError;
  }
}
