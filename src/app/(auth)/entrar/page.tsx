"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { entrarSchema, type EntrarInput } from "@/src/lib/validations/auth";
import { entrar } from "./actions";

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}

/** Em componente à parte: `useSearchParams` (o `?next=`) exige Suspense. */
function EntrarForm() {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? undefined;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntrarInput>({ resolver: zodResolver(entrarSchema) });

  async function onSubmit(data: EntrarInput) {
    setErroServidor(null);
    const resultado = await entrar(data, next);
    if (resultado.error) setErroServidor(resultado.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Entrar</h1>

      <TextField
        label="E-mail"
        htmlFor="email"
        type="email"
        autoComplete="email"
        placeholder="voce@ufu.br"
        error={errors.email?.message}
        {...register("email")}
      />
      <TextField
        label="Senha"
        htmlFor="senha"
        type="password"
        autoComplete="current-password"
        error={errors.senha?.message}
        {...register("senha")}
      />

      {erroServidor ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {erroServidor}
        </p>
      ) : null}

      <Button type="submit" className="rounded-pill" disabled={isSubmitting}>
        Entrar
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-primary">
          Cadastre-se
        </Link>
      </p>
    </form>
  );
}
