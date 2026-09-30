"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { cadastroSchema, type CadastroInput } from "@/src/lib/validations/auth";

export default function CadastroPage() {
  const [avisoPendente, setAvisoPendente] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({ resolver: zodResolver(cadastroSchema) });

  // TODO(kaike): trocar por Server Action (signUp, mandando username/full_name
  // em options.data pro trigger handle_new_user) assim que src/lib/supabase
  // existir — ver PENDENCIAS-KAIKE.md.
  async function onSubmit() {
    setAvisoPendente(
      "Cadastro ainda não está disponível: aguardando os clientes Supabase (lib/supabase).",
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Criar conta</h1>

      <TextField
        label="Nome"
        htmlFor="nome"
        autoComplete="name"
        error={errors.nome?.message}
        {...register("nome")}
      />
      <TextField
        label="Username"
        htmlFor="username"
        hint="Só letras minúsculas, números e _"
        error={errors.username?.message}
        {...register("username")}
      />
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
        autoComplete="new-password"
        error={errors.senha?.message}
        {...register("senha")}
      />
      <TextField
        label="Confirmar senha"
        htmlFor="confirmarSenha"
        type="password"
        autoComplete="new-password"
        error={errors.confirmarSenha?.message}
        {...register("confirmarSenha")}
      />

      {avisoPendente ? (
        <p className="text-xs text-muted-foreground" role="status">
          {avisoPendente}
        </p>
      ) : null}

      <Button type="submit" className="rounded-pill" disabled={isSubmitting}>
        Criar conta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/entrar" className="font-semibold text-primary">
          Entrar
        </Link>
      </p>
    </form>
  );
}
