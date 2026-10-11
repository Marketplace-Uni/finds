import { describe, expect, it } from "vitest";

import { reportSchema } from "./reports";

const listingId = "d2f6b2f0-9c1a-4b1a-9a1a-1a2b3c4d5e6f";

describe("reportSchema", () => {
  it("aceita motivos previstos com descrição opcional", () => {
    expect(
      reportSchema.safeParse({
        listingId,
        reason: "golpe",
      }).success,
    ).toBe(true);
  });

  it("rejeita motivo não previsto, anúncio inválido e descrição longa", () => {
    expect(reportSchema.safeParse({ listingId, reason: "qualquer-coisa" }).success).toBe(false);
    expect(reportSchema.safeParse({ listingId: "anuncio", reason: "spam" }).success).toBe(false);
    expect(
      reportSchema.safeParse({
        listingId,
        reason: "spam",
        description: "a".repeat(1001),
      }).success,
    ).toBe(false);
  });
});
