import { describe, expect, it } from "vitest";

import { cadastroSchema, entrarSchema } from "./auth";

const cadastroValido = {
  nome: "Maria Silva",
  username: "maria_silva",
  email: "maria@ufu.br",
  senha: "12345678",
  confirmarSenha: "12345678",
};

describe("cadastroSchema", () => {
  it("aceita um cadastro válido com e-mail @ufu.br", () => {
    const result = cadastroSchema.safeParse(cadastroValido);
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail fora do domínio @ufu.br", () => {
    const result = cadastroSchema.safeParse({
      ...cadastroValido,
      email: "maria@gmail.com",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita senha menor que 8 caracteres", () => {
    const result = cadastroSchema.safeParse({
      ...cadastroValido,
      senha: "123",
      confirmarSenha: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita quando a confirmação de senha diverge", () => {
    const result = cadastroSchema.safeParse({
      ...cadastroValido,
      confirmarSenha: "outrasenha",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita username com caracteres inválidos", () => {
    const result = cadastroSchema.safeParse({
      ...cadastroValido,
      username: "Maria Silva!",
    });
    expect(result.success).toBe(false);
  });
});

describe("entrarSchema", () => {
  it("aceita e-mail @ufu.br e senha preenchida", () => {
    const result = entrarSchema.safeParse({ email: "maria@ufu.br", senha: "12345678" });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail fora do domínio @ufu.br", () => {
    const result = entrarSchema.safeParse({ email: "maria@hotmail.com", senha: "12345678" });
    expect(result.success).toBe(false);
  });

  it("rejeita senha vazia", () => {
    const result = entrarSchema.safeParse({ email: "maria@ufu.br", senha: "" });
    expect(result.success).toBe(false);
  });
});
