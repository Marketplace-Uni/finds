/**
 * Algoritmo de match de roommates (docs/ARQUITETURA.md). Lógica pura, sem
 * acesso a banco — quem busca os dados é `src/lib/traits.ts`.
 *
 * `self`/`wanted` guardam `trait.key` (ex.: "dorme-cedo"), não o `id` do
 * banco: é o identificador estável que o `<ConvivenciaPicker>` já usa nos
 * checkboxes, então não precisa de tradução pra exibir ou comparar.
 */
export interface UserTraits {
  self: Set<string>;
  wanted: Set<string>;
}

/**
 * aderência(A→B) = |procuro(A) ∩ sou(B)| / |procuro(A)|
 */
export function adherence(from: UserTraits, to: UserTraits): number {
  if (from.wanted.size === 0) return 0;

  let matches = 0;
  for (const trait of from.wanted) {
    if (to.self.has(trait)) matches++;
  }

  return matches / from.wanted.size;
}

/**
 * score = média das aderências que existirem (só entram no cálculo os
 * lados que de fato têm tags "procuro" definidas).
 */
export function matchScore(a: UserTraits, b: UserTraits): number | null {
  const scores: number[] = [];
  if (a.wanted.size > 0) scores.push(adherence(a, b));
  if (b.wanted.size > 0) scores.push(adherence(b, a));

  if (scores.length === 0) return null;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * As tags que "explicam" o score: todo trait que algum lado procura e o
 * outro tem em "eu sou" (nos dois sentidos). É o que o `<MatchCard>` mostra
 * em "Vocês dois:" — sem elas, a porcentagem é só um número solto.
 */
export function matchingTraitKeys(a: UserTraits, b: UserTraits): string[] {
  const result = new Set<string>();
  for (const trait of a.wanted) if (b.self.has(trait)) result.add(trait);
  for (const trait of b.wanted) if (a.self.has(trait)) result.add(trait);
  return [...result];
}
