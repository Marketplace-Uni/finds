import { describe, expect, it } from "vitest";

import { transactionActionSchema } from "./transactions";

describe("transactionActionSchema", () => {
  it("aceita propor, aceitar e concluir uma negociação", () => {
    for (const status of ["propose", "accept", "complete"] as const) {
      expect(transactionActionSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("exige motivo ao cancelar ou recusar", () => {
    expect(transactionActionSchema.safeParse({ status: "cancel" }).success).toBe(false);
    expect(
      transactionActionSchema.safeParse({
        status: "cancel",
        cancelReason: "Desisti da compra",
      }).success,
    ).toBe(true);
  });

  it("rejeita motivo acima do limite", () => {
    expect(
      transactionActionSchema.safeParse({
        status: "cancel",
        cancelReason: "a".repeat(501),
      }).success,
    ).toBe(false);
  });
});
