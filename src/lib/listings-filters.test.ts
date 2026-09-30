import { describe, expect, it } from "vitest";

import {
  DEFAULT_ORDER,
  LISTING_TYPE_BY_FILTER_VALUE,
  parseListingFilters,
} from "./listings-filters";

describe("parseListingFilters", () => {
  it("retorna os valores padrão quando não há nenhum filtro na URL", () => {
    expect(parseListingFilters({})).toEqual({
      q: null,
      tipo: [],
      categoria: [],
      campus: null,
      condicao: [],
      precoMin: null,
      precoMax: null,
      ordem: DEFAULT_ORDER,
    });
  });

  it("lê um único valor de campo multi-seleção (checkbox único marcado)", () => {
    const filters = parseListingFilters({ tipo: "produto" });
    expect(filters.tipo).toEqual(["produto"]);
  });

  it("lê múltiplos valores de campo multi-seleção (vários checkboxes marcados)", () => {
    const filters = parseListingFilters({ tipo: ["produto", "servico"] });
    expect(filters.tipo).toEqual(["produto", "servico"]);
  });

  it("lê campo de seleção única (campus/ordem) mesmo se vier como array", () => {
    const filters = parseListingFilters({ campus: ["santa-monica", "umuarama"] });
    expect(filters.campus).toBe("santa-monica");
  });

  it("converte preco_min e preco_max para número", () => {
    const filters = parseListingFilters({ preco_min: "50", preco_max: "900" });
    expect(filters.precoMin).toBe(50);
    expect(filters.precoMax).toBe(900);
  });

  it("ignora preco_min/preco_max inválidos", () => {
    const filters = parseListingFilters({ preco_min: "abc" });
    expect(filters.precoMin).toBeNull();
  });

  it("preserva o termo de busca (q)", () => {
    const filters = parseListingFilters({ q: "bicicleta" });
    expect(filters.q).toBe("bicicleta");
  });
});

describe("LISTING_TYPE_BY_FILTER_VALUE", () => {
  it("mapeia os 4 tipos do chip (pt-BR) para o enum listing_type do banco", () => {
    expect(LISTING_TYPE_BY_FILTER_VALUE).toEqual({
      produto: "product",
      servico: "service",
      roommate: "roommate",
      republica: "republic",
    });
  });
});
