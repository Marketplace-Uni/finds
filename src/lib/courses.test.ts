import { describe, expect, it } from "vitest";

import { COURSES_BY_CAMPUS, coursesForCampus } from "./courses";

describe("coursesForCampus", () => {
  it("retorna os cursos do campus pedido", () => {
    const cursos = coursesForCampus("Umuarama");
    expect(cursos).toContain("Medicina");
    expect(cursos.length).toBeGreaterThan(0);
  });

  it("ignora espaço em branco no nome do campus", () => {
    expect(coursesForCampus("  Umuarama  ")).toEqual(coursesForCampus("Umuarama"));
  });

  it("retorna vazio para campus sem dado (fora de Uberlândia) ou nulo", () => {
    expect(coursesForCampus("Pontal")).toEqual([]);
    expect(coursesForCampus(null)).toEqual([]);
    expect(coursesForCampus(undefined)).toEqual([]);
  });

  it("não tem curso repetido dentro de um mesmo campus", () => {
    for (const cursos of Object.values(COURSES_BY_CAMPUS)) {
      expect(new Set(cursos).size).toBe(cursos.length);
    }
  });
});
