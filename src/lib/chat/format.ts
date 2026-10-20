/**
 * "12:00" se for hoje, "ontem" se for ontem, "20/10" caso contrário.
 *
 * Extraída de `mensagens/page.tsx` (Server Component) pra um módulo
 * client-safe: o client component que aplica mensagens do Realtime
 * (`ChatConversation`) também precisa formatar a hora, e não dá pra importar
 * uma função de dentro de uma rota (traria o módulo da página inteira pro
 * bundle do cliente).
 */
export function formatMessageTime(
  value: string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const today = now;
  const isSameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  if (isSameDay(date, today)) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, yesterday)) return "ontem";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
