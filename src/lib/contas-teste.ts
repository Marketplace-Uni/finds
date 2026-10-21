/**
 * Fonte única das 5 contas de demonstração usadas na Mostra: criadas por
 * `scripts/seed-contas-teste.ts` e exibidas em `/como-testar`, pra nunca
 * divergir senha/e-mail entre o que foi configurado no Supabase e o que é
 * mostrado na página.
 *
 * Nascem vazias de propósito (sem campus, sem anúncio) — o visitante é quem
 * completa o perfil e explora. Se mudar algo aqui, atualize também
 * `docs/contas-teste.md` (markdown não importa este arquivo).
 */
export type ContaTeste = {
  email: string;
  senha: string;
  username: string;
  full_name: string;
};

export const CONTA_TESTE_MARKER = "finds-conta-teste";

export const CONTAS_TESTE: ContaTeste[] = Array.from({ length: 5 }, (_, index) => {
  const numero = index + 1;
  return {
    email: `teste${numero}@ufu.br`,
    senha: "teste12345",
    username: `teste${numero}`,
    full_name: `Conta de Teste ${numero}`,
  };
});
