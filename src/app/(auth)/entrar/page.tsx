import { EntrarForm } from "./entrar-form";

/**
 * Server Component: lê `?next=` aqui e passa pronto pro form (client), em
 * vez de ler com `useSearchParams()` lá dentro — ver o comentário em
 * `entrar-form.tsx` sobre por que isso importa nesta página especificamente
 * (ela é 100% estática, sem nenhum dado que dependa do usuário logado).
 */
export default async function EntrarPage({ searchParams }: PageProps<"/entrar">) {
  const { next: nextParam } = await searchParams;
  const next = typeof nextParam === "string" ? nextParam : undefined;

  return <EntrarForm next={next} />;
}
