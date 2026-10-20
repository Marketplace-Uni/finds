import { describe, expect, it } from "vitest";
import { pickLastMessagePerConversation } from "./last-message";

describe("pickLastMessagePerConversation", () => {
  it("pega só a primeira ocorrência (mais recente) de cada conversa", () => {
    const resultado = pickLastMessagePerConversation([
      { conversation_id: "a", content: "mais recente de a", created_at: "2026-10-20T12:00:00Z" },
      { conversation_id: "b", content: "mais recente de b", created_at: "2026-10-20T11:00:00Z" },
      { conversation_id: "a", content: "mais antiga de a", created_at: "2026-10-20T10:00:00Z" },
    ]);

    expect(resultado.get("a")?.content).toBe("mais recente de a");
    expect(resultado.get("b")?.content).toBe("mais recente de b");
    expect(resultado.size).toBe(2);
  });

  it("devolve um Map vazio pra uma lista vazia", () => {
    expect(pickLastMessagePerConversation([]).size).toBe(0);
  });

  it("ignora conversas sem nenhuma mensagem (não aparecem no Map)", () => {
    const resultado = pickLastMessagePerConversation([
      { conversation_id: "a", content: "oi", created_at: "2026-10-20T12:00:00Z" },
    ]);

    expect(resultado.has("b")).toBe(false);
  });
});
