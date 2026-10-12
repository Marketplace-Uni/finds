import { describe, expect, it } from "vitest";

import { buildListingDisplay } from "./listing-details";

describe("buildListingDisplay", () => {
  it("product: categoria, condição e marca", () => {
    const result = buildListingDisplay("product", {
      category: "eletrônicos",
      condition: "seminovo",
      brand: "Dell",
    });

    expect(result.categories).toEqual(["eletrônicos"]);
    expect(result.attributes).toEqual(["seminovo"]);
    expect(result.specs).toEqual([{ label: "Marca", value: "Dell" }]);
    expect(result.priceNote).toBeNull();
  });

  it("service: modalidade vira spec e price_unit vira priceNote", () => {
    const result = buildListingDisplay("service", {
      category: "aulas",
      modality: "flexivel",
      price_unit: "hora",
    });

    expect(result.categories).toEqual(["aulas"]);
    expect(result.specs).toEqual([{ label: "Modalidade", value: "Flexível" }]);
    expect(result.priceNote).toBe("por hora");
  });

  it("service: price_unit 'a combinar' não gera priceNote", () => {
    const result = buildListingDisplay("service", {
      modality: "online",
      price_unit: "a combinar",
    });

    expect(result.priceNote).toBeNull();
  });

  it("roommate: monta os specs de moradia", () => {
    const result = buildListingDisplay("roommate", {
      mode: "procura_vaga",
      housing_type: "apartamento",
      neighborhood: "Santa Mônica",
      move_in_date: "2026-11-01",
      gender_preference: "feminino",
    });

    expect(result.specs).toEqual([
      { label: "Modo", value: "Procura vaga" },
      { label: "Tipo de moradia", value: "Apartamento" },
      { label: "Bairro", value: "Santa Mônica" },
      { label: "Data de entrada", value: "01/11/2026" },
      { label: "Preferência de gênero", value: "Feminino" },
    ]);
  });

  it("republic: amenities viram categorias e gênero vira atributo", () => {
    const result = buildListingDisplay("republic", {
      vacancies: 2,
      gender: "mista",
      neighborhood: "Umuarama",
      amenities: ["wifi", "mobiliada"],
    });

    expect(result.categories).toEqual(["wifi", "mobiliada"]);
    expect(result.attributes).toEqual(["mista"]);
    expect(result.specs).toEqual([
      { label: "Vagas", value: "2" },
      { label: "Bairro", value: "Umuarama" },
    ]);
  });

  it("details inválido ou nulo não quebra, só vem vazio", () => {
    expect(buildListingDisplay("product", null)).toEqual({
      categories: [],
      attributes: [],
      specs: [],
      priceNote: null,
    });
    expect(buildListingDisplay("product", { condition: "não-existe" })).toEqual({
      categories: [],
      attributes: [],
      specs: [],
      priceNote: null,
    });
  });
});
