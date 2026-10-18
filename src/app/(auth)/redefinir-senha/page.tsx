"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { PasswordField } from "@/src/components/ui/password-field";
import { ErrorState, LoadingState } from "@/src/components/ui/states";
import { createClient } from "@/src/lib/supabase/client";
import { redefinirSenhaSchema, type RedefinirSenhaInput } from "@/src/lib/validations/auth";

type Status = "verificando" | "pronto" | "invalido" | "sucesso";

/**
 * O link do e-mail de recuperação volta pra cá com o token na URL. O
 * `createClient()` do browser (`@supabase/ssr`) já lê esse token sozinho e
 * dispara o evento `PASSWORD_RECOVERY` com uma sessão temporária — dá pra
 * chamar `updateUser({ password })` direto daqui, sem Server Action.
 */
export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verificando");
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RedefinirSenhaInput>({ resolver: zodResolver(redefinirSenhaSchema) });

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStatus((atual) => (atual === "verificando" ? "pronto" : atual));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setStatus("pronto");
    });

    // Sem evento nem sessão depois de um tempo: o link é inválido ou expirou.
    const semSessao = setTimeout(() => {
      setStatus((atual) => (atual === "verificando" ? "invalido" : atual));
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(semSessao);
    };
  }, []);

  async function onSubmit(data: RedefinirSenhaInput) {
    setErroServidor(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.senha });
    if (error) {
      setErroServidor("Não foi possível trocar a senha agora. Peça um novo link e tente de novo.");
      return;
    }
    setStatus("sucesso");
    setTimeout(() => router.push("/"), 1500);
  }

  if (status === "verificando") {
    return <LoadingState description="Verificando o link..." />;
  }

  if (status === "invalido") {
    return (
      <ErrorState
        title="Link inválido ou expirado"
        description="Peça um novo link na tela de recuperar senha."
        action={
          <Button asChild className="rounded-pill px-8">
            <Link href="/recuperar-senha">Pedir novo link</Link>
          </Button>
        }
      />
    );
  }

  if (status === "sucesso") {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-lg font-semibold text-foreground">Senha atualizada!</p>
        <p className="text-sm text-muted-foreground">Te levando pro Finds...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Defina uma nova senha</h1>

      <PasswordField
        label="Nova senha"
        htmlFor="senha"
        autoComplete="new-password"
        error={errors.senha?.message}
        {...register("senha")}
      />
      <PasswordField
        label="Confirmar nova senha"
        htmlFor="confirmarSenha"
        autoComplete="new-password"
        error={errors.confirmarSenha?.message}
        {...register("confirmarSenha")}
      />

      {erroServidor ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {erroServidor}
        </p>
      ) : null}

      <Button type="submit" className="rounded-pill" disabled={isSubmitting}>
        Salvar nova senha
      </Button>
    </form>
  );
}
