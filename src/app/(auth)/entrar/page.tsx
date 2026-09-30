"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { entrarSchema, type EntrarInput } from "@/src/lib/validations/auth";

export default function EntrarPage() {
  const [avisoPendente, setAvisoPendente] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EntrarInput>({ resolver: zodResolver(entrarSchema) });

  // TODO(kaike): trocar por Server Action (signInWithPassword) assim que
  // src/lib/supabase/server.ts existir — ver PENDENCIAS-KAIKE.md.
  async function onSubmit() {
    setAvisoPendente(
      "Login ainda não está disponível: aguardando os clientes Supabase (lib/supabase).",
    );
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

      {avisoPendente ? (
        <p className="text-xs text-muted-foreground" role="status">
          {avisoPendente}
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
