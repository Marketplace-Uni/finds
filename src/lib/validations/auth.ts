import { z } from "zod";

/**
 * Domínio único suportado hoje (universities.email_domain = "ufu.br").
 * Se o Finds passar a atender mais de uma universidade, trocar por uma
 * consulta a `universities.email_domain` em vez de regex fixa.
 */
const EMAIL_DOMAIN_REGEX = /@ufu\.br$/i;

const emailUfuSchema = z
  .string()
  .trim()
  .min(1, "Informe o e-mail")
  .email("E-mail inválido")
  .regex(EMAIL_DOMAIN_REGEX, "Use seu e-mail @ufu.br");

const senhaSchema = z
  .string()
  .min(8, "A senha precisa ter pelo menos 8 caracteres");

export const cadastroSchema = z
  .object({
    nome: z.string().trim().min(1, "Informe seu nome"),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "O username precisa ter pelo menos 3 caracteres")
      .max(20, "O username pode ter no máximo 20 caracteres")
      .regex(/^[a-z0-9_]+$/, "Use só letras minúsculas, números e _"),
    email: emailUfuSchema,
    senha: senhaSchema,
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  });

export type CadastroInput = z.infer<typeof cadastroSchema>;

export const entrarSchema = z.object({
  email: emailUfuSchema,
  senha: z.string().min(1, "Informe a senha"),
});

export type EntrarInput = z.infer<typeof entrarSchema>;
