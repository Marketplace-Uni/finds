import { describe, expect, it } from "vitest";

import { sendMessageSchema } from "./chat";

const conversationId = "11111111-1111-4111-8111-111111111111";

describe("sendMessageSchema", () => {
  it("accepts a trimmed message and a valid conversation id", () => {
    expect(
      sendMessageSchema.parse({
        conversationId,
        content: "  Olá!  ",
      }),
    ).toEqual({ conversationId, content: "Olá!" });
  });

  it("rejects empty messages and messages over 2000 characters", () => {
    expect(
      sendMessageSchema.safeParse({ conversationId, content: "   " }).success,
    ).toBe(false);
    expect(
      sendMessageSchema.safeParse({
        conversationId,
        content: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });

  it("rejects an invalid conversation id", () => {
    expect(
      sendMessageSchema.safeParse({
        conversationId: "not-a-uuid",
        content: "Olá",
      }).success,
    ).toBe(false);
  });
});
