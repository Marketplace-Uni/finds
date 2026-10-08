import { describe, expect, it } from "vitest";

import { formatLastSeen } from "./format";

describe("formatLastSeen", () => {
  const now = new Date("2026-10-07T12:00:00Z");

  it("retorna 'nunca esteve online' quando a data é null/undefined", () => {
    expect(formatLastSeen(null, now)).toBe("nunca esteve online");
    expect(formatLastSeen(undefined, now)).toBe("nunca esteve online");
  });

  it("retorna 'ativo agora' para menos de 1 minuto", () => {
    expect(formatLastSeen(new Date(now.getTime() - 30_000).toISOString(), now)).toBe(
      "ativo agora",
    );
  });

  it("retorna minutos quando faz menos de 1h", () => {
    expect(formatLastSeen(new Date(now.getTime() - 5 * 60_000).toISOString(), now)).toBe(
      "ativo há 5min",
    );
  });

  it("retorna horas quando faz menos de 1 dia", () => {
    expect(formatLastSeen(new Date(now.getTime() - 2 * 60 * 60_000).toISOString(), now)).toBe(
      "ativo há 2h",
    );
  });

  it("retorna dias quando faz mais de 24h", () => {
    expect(formatLastSeen(new Date(now.getTime() - 3 * 24 * 60 * 60_000).toISOString(), now)).toBe(
      "ativo há 3d",
    );
  });

  it("nunca retorna tempo negativo quando a data vem do futuro (relógio dessincronizado)", () => {
    expect(formatLastSeen(new Date(now.getTime() + 60_000).toISOString(), now)).toBe(
      "ativo agora",
    );
  });
});
