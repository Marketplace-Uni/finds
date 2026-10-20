import { describe, expect, it } from "vitest";
import { formatMessageTime } from "./format";

const HOJE = new Date("2026-10-20T18:00:00");

describe("formatMessageTime", () => {
  it("retorna null pra valor vazio", () => {
    expect(formatMessageTime(null, HOJE)).toBeNull();
    expect(formatMessageTime(undefined, HOJE)).toBeNull();
  });

  it("retorna null pra data inválida", () => {
    expect(formatMessageTime("não é uma data", HOJE)).toBeNull();
  });

  it("formata como hora:minuto quando é hoje", () => {
    expect(formatMessageTime("2026-10-20T09:05:00", HOJE)).toBe("09:05");
  });

  it("formata como \"ontem\" quando é o dia anterior", () => {
    expect(formatMessageTime("2026-10-19T23:59:00", HOJE)).toBe("ontem");
  });

  it("formata como dd/mm pra datas mais antigas", () => {
    expect(formatMessageTime("2026-10-01T12:00:00", HOJE)).toBe("01/10");
  });
});
