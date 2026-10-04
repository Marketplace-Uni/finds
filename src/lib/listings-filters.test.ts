import { describe, expect, it } from "vitest";

import {
  DEFAULT_ORDER,
  LISTING_TYPE_BY_FILTER_VALUE,
  buildListingsHref,
  parseListingFilters,
  parsePage,
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

describe("parsePage", () => {
  it("retorna 1 quando não há `pagina` na URL", () => {
    expect(parsePage({})).toBe(1);
  });

  it("lê a página atual", () => {
    expect(parsePage({ pagina: "3" })).toBe(3);
  });

  it("nunca retorna menos que 1 (valor inválido ou negativo)", () => {
    expect(parsePage({ pagina: "0" })).toBe(1);
    expect(parsePage({ pagina: "-5" })).toBe(1);
    expect(parsePage({ pagina: "abc" })).toBe(1);
  });
});

describe("buildListingsHref", () => {
  it("sem filtros e página 1, retorna só o path", () => {
    expect(buildListingsHref("/", {}, 1)).toBe("/");
  });

  it("preserva os filtros existentes e adiciona `pagina`", () => {
    const href = buildListingsHref("/", { tipo: ["produto", "servico"], campus: "santa-monica" }, 2);
    expect(href).toBe("/?tipo=produto&tipo=servico&campus=santa-monica&pagina=2");
  });

  it("troca a `pagina` antiga pela nova, sem duplicar", () => {
    const href = buildListingsHref("/busca", { q: "bicicleta", pagina: "2" }, 3);
    expect(href).toBe("/busca?q=bicicleta&pagina=3");
  });
});
