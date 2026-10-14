import { describe, expect, it } from "vitest";

import { reviewSchema } from "./reviews";

const transactionId = "d2f6b2f0-9c1a-4b1a-9a1a-1a2b3c4d5e6f";

describe("reviewSchema", () => {
  it("aceita avaliações com nota entre 1 e 5 e comentário opcional", () => {
    expect(
      reviewSchema.safeParse({ transactionId, rating: "5", comment: "Ótima negociação." })
        .success,
    ).toBe(true);
    expect(reviewSchema.safeParse({ transactionId, rating: "1" }).success).toBe(true);
  });

  it("rejeita nota fora do intervalo, fracionária e negociação inválida", () => {
    for (const rating of ["0", "6", "2.5", "nota"]) {
      expect(reviewSchema.safeParse({ transactionId, rating }).success).toBe(false);
    }
    expect(reviewSchema.safeParse({ transactionId: "inválida", rating: "4" }).success).toBe(false);
  });

  it("limita o comentário a 500 caracteres", () => {
    expect(
      reviewSchema.safeParse({ transactionId, rating: "4", comment: "a".repeat(501) })
        .success,
    ).toBe(false);
  });
});
