const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 150 -> "R$ 150,00" */
export function formatPrice(value: number) {
  return brl.format(value);
}

/**
 * "material de estudo" -> "Material de estudo" — só a primeira letra, pro
 * rótulo de opções que no banco/schema/filtros continuam em minúsculo (ver
 * `src/lib/validations/listings.ts`); usar isto só no texto exibido, nunca
 * no `value` salvo.
 */
export function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/**
 * null -> "nunca esteve online"; "2026-10-07T12:00:00Z" (agora) -> "ativo agora";
 * há 2h -> "ativo há 2h". `now` é injetável para teste.
 */
export function formatLastSeen(date: string | null | undefined, now: Date = new Date()): string {
  if (!date) return "nunca esteve online";

  const diffMs = Math.max(0, now.getTime() - new Date(date).getTime());

  if (diffMs < MINUTE_MS) return "ativo agora";
  if (diffMs < HOUR_MS) return `ativo há ${Math.floor(diffMs / MINUTE_MS)}min`;
  if (diffMs < DAY_MS) return `ativo há ${Math.floor(diffMs / HOUR_MS)}h`;
  return `ativo há ${Math.floor(diffMs / DAY_MS)}d`;
}
