import { describe, expect, it } from "vitest";

import { completarPerfilSchema } from "./profile";

describe("completarPerfilSchema", () => {
  it("aceita um campusId válido (uuid)", () => {
    const result = completarPerfilSchema.safeParse({
      campusId: "d2f6b2f0-9c1a-4b1a-9a1a-1a2b3c4d5e6f",
    });
    expect(result.success).toBe(true);
  });

  it("aceita o next opcional junto com o campusId", () => {
    const result = completarPerfilSchema.safeParse({
      campusId: "d2f6b2f0-9c1a-4b1a-9a1a-1a2b3c4d5e6f",
      next: "/anuncios/123",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita campusId ausente", () => {
    const result = completarPerfilSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejeita campusId que não é um uuid", () => {
    const result = completarPerfilSchema.safeParse({ campusId: "campus-1" });
    expect(result.success).toBe(false);
  });
});
