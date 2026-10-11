export function UnreadBadge({ count }: { count: number }) {
  if (count < 1) return null;

  return (
    <span
      className="grid min-w-4 place-items-center rounded-pill bg-primary px-1 text-xs leading-4 font-bold text-primary-foreground"
      aria-label={`${count} mensagem${count === 1 ? "" : "ns"} não lida${count === 1 ? "" : "s"}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
