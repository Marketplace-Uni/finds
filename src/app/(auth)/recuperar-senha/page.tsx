"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { recuperarSenhaSchema, type RecuperarSenhaInput } from "@/src/lib/validations/auth";
import { recuperarSenha } from "./actions";

export default function RecuperarSenhaPage() {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecuperarSenhaInput>({ resolver: zodResolver(recuperarSenhaSchema) });

  async function onSubmit(data: RecuperarSenhaInput) {
    setErroServidor(null);
    const resultado = await recuperarSenha(data, window.location.origin);
    if (resultado.error) {
      setErroServidor(resultado.error);
      return;
    }
    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-semibold text-foreground">Confira seu e-mail</h1>
        <p className="text-sm text-muted-foreground">
          Se existir uma conta com esse e-mail, mandamos um link para você criar uma senha nova.
        </p>
        <Link href="/entrar" className="text-sm font-semibold text-primary">
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Recuperar senha</h1>
      <p className="text-sm text-muted-foreground">
        Informe seu e-mail @ufu.br e mandamos um link para você criar uma senha nova.
      </p>

      <TextField
        label="E-mail"
        htmlFor="email"
        type="email"
        autoComplete="email"
        placeholder="voce@ufu.br"
        error={errors.email?.message}
        {...register("email")}
      />

      {erroServidor ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {erroServidor}
        </p>
      ) : null}

      <Button type="submit" className="rounded-pill" disabled={isSubmitting}>
        Enviar link
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Lembrou a senha?{" "}
        <Link href="/entrar" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}
