import { describe, expect, it } from "vitest";

import { adherence, matchingTraitKeys, matchScore, type UserTraits } from "./match";

function traits(self: string[], wanted: string[]): UserTraits {
  return { self: new Set(self), wanted: new Set(wanted) };
}

/**
 * Casos conhecidos a partir do `traitAssignments` real de `scripts/seed.ts`
 * (usuários 001, 003 e 004 do finds-dev), calculados a mão a partir da
 * fórmula de docs/ARQUITETURA.md — cumpre o "validado com 3–4 casos
 * conhecidos" do checklist da Sprint 2 com dados reais do time, não fixtures
 * inventadas.
 */
describe("matchScore com dados reais do seed", () => {
  const usuario001 = traits(
    ["organizado", "nao-fuma", "estuda-em-casa"],
    ["gosta-silencio", "divide-tarefas", "nao-fuma"],
  );
  const usuario003 = traits(
    ["dorme-cedo", "gosta-silencio", "organizado"],
    ["dorme-cedo", "poucas-visitas", "nao-fuma"],
  );
  const usuario004 = traits(
    ["estuda-em-casa", "acorda-cedo", "pontual"],
    ["organizado", "gosta-silencio", "acorda-cedo"],
  );

  it("001 x 003: aderência 1/3 nos dois sentidos, score 1/3", () => {
    expect(adherence(usuario001, usuario003)).toBeCloseTo(1 / 3);
    expect(adherence(usuario003, usuario001)).toBeCloseTo(1 / 3);
    expect(matchScore(usuario001, usuario003)).toBeCloseTo(1 / 3);
    expect(matchingTraitKeys(usuario001, usuario003).sort()).toEqual(
      ["gosta-silencio", "nao-fuma"].sort(),
    );
  });

  it("001 x 004: aderência assimétrica (0 e 1/3), score 1/6", () => {
    expect(adherence(usuario001, usuario004)).toBe(0);
    expect(adherence(usuario004, usuario001)).toBeCloseTo(1 / 3);
    expect(matchScore(usuario001, usuario004)).toBeCloseTo(1 / 6);
    expect(matchingTraitKeys(usuario001, usuario004)).toEqual(["organizado"]);
  });

  it("003 x 004: aderência assimétrica (0 e 2/3), score 1/3", () => {
    expect(adherence(usuario003, usuario004)).toBe(0);
    expect(adherence(usuario004, usuario003)).toBeCloseTo(2 / 3);
    expect(matchScore(usuario003, usuario004)).toBeCloseTo(1 / 3);
    expect(matchingTraitKeys(usuario003, usuario004).sort()).toEqual(
      ["gosta-silencio", "organizado"].sort(),
    );
  });
});

describe("adherence", () => {
  it("retorna 0 quando o usuário não procura nada", () => {
    const a = traits([], []);
    const b = traits(["organizado"], []);
    expect(adherence(a, b)).toBe(0);
  });

  it("retorna 1 quando todas as tags procuradas existem no outro", () => {
    const a = traits([], ["organizado", "silencioso"]);
    const b = traits(["organizado", "silencioso", "extra"], []);
    expect(adherence(a, b)).toBe(1);
  });

  it("retorna a fração de interseção quando o match é parcial", () => {
    const a = traits([], ["organizado", "silencioso", "festeiro"]);
    const b = traits(["organizado"], []);
    expect(adherence(a, b)).toBeCloseTo(1 / 3);
  });
});

describe("matchScore", () => {
  it("retorna null quando nenhum dos dois lados tem tags 'procuro'", () => {
    const a = traits(["organizado"], []);
    const b = traits(["silencioso"], []);
    expect(matchScore(a, b)).toBeNull();
  });

  it("retorna a média das aderências quando os dois lados procuram algo (match total)", () => {
    const a = traits(["silencioso"], ["organizado"]);
    const b = traits(["organizado"], ["silencioso"]);
    expect(matchScore(a, b)).toBe(1);
  });

  it("usa só a aderência do lado que tem tags 'procuro' quando o outro não tem", () => {
    const a = traits([], ["organizado"]);
    const b = traits(["organizado"], []);
    expect(matchScore(a, b)).toBe(1);
  });

  it("retorna a média correta em um match assimétrico", () => {
    const a = traits(["extrovertido"], ["organizado", "silencioso"]);
    const b = traits(["organizado"], ["extrovertido"]);
    expect(matchScore(a, b)).toBeCloseTo((0.5 + 1) / 2);
  });

  it("retorna 0 quando não há nenhuma interseção", () => {
    const a = traits([], ["organizado"]);
    const b = traits(["festeiro"], []);
    expect(matchScore(a, b)).toBe(0);
  });
});

describe("matchingTraitKeys", () => {
  it("retorna vazio quando não há interseção em nenhum sentido", () => {
    const a = traits([], ["organizado"]);
    const b = traits(["festeiro"], []);
    expect(matchingTraitKeys(a, b)).toEqual([]);
  });

  it("junta as interseções dos dois sentidos sem repetir", () => {
    const a = traits(["silencioso"], ["organizado"]);
    const b = traits(["organizado"], ["silencioso"]);
    expect(matchingTraitKeys(a, b).sort()).toEqual(["organizado", "silencioso"]);
  });
});
