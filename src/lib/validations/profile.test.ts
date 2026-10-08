import { describe, expect, it } from "vitest";

import { completarPerfilSchema, convivenciaSchema, editarPerfilSchema } from "./profile";

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

describe("editarPerfilSchema", () => {
  const campusId = "d2f6b2f0-9c1a-4b1a-9a1a-1a2b3c4d5e6f";

  it("aceita nome, bio e campus válidos", () => {
    const result = editarPerfilSchema.safeParse({
      fullName: "Fulano de Tal",
      bio: "Estudante de Engenharia.",
      campusId,
    });
    expect(result.success).toBe(true);
  });

  it("aceita bio vazia ou ausente", () => {
    expect(editarPerfilSchema.safeParse({ fullName: "Fulano", bio: "", campusId }).success).toBe(
      true,
    );
    expect(editarPerfilSchema.safeParse({ fullName: "Fulano", campusId }).success).toBe(true);
  });

  it("rejeita nome muito curto", () => {
    const result = editarPerfilSchema.safeParse({ fullName: "F", campusId });
    expect(result.success).toBe(false);
  });

  it("rejeita bio acima de 280 caracteres", () => {
    const result = editarPerfilSchema.safeParse({
      fullName: "Fulano",
      bio: "a".repeat(281),
      campusId,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita campusId inválido", () => {
    const result = editarPerfilSchema.safeParse({ fullName: "Fulano", campusId: "nao-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("convivenciaSchema", () => {
  it("aceita arrays de keys em sou e procuro", () => {
    const result = convivenciaSchema.safeParse({
      sou: ["organizado", "nao-fuma"],
      procuro: ["gosta-silencio"],
    });
    expect(result.success).toBe(true);
  });

  it("usa array vazio quando sou/procuro não vêm", () => {
    const result = convivenciaSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ sou: [], procuro: [] });
    }
  });
});
