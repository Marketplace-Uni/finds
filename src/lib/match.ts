/**
 * Rascunho de Sprint 0 do algoritmo de match de roommates (docs/ARQUITETURA.md).
 * Sera refinado na Sprint 2 com os IDs reais de `traits`/`user_traits`.
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
