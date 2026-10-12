"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { PasswordField } from "@/src/components/ui/password-field";
import { LogoFinds } from "@/src/components/layout/logo-finds";
import { cadastroSchema, type CadastroInput } from "@/src/lib/validations/auth";
import { cadastrar } from "./actions";

export default function CadastroPage() {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CadastroInput>({ resolver: zodResolver(cadastroSchema) });

  async function onSubmit(data: CadastroInput) {
    setErroServidor(null);
    const resultado = await cadastrar(data);
    if (resultado.error) setErroServidor(resultado.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/*
        O painel <AuthArt> do Caike já tem logo + "Bem-vindo ao Finds!", mas
        só aparece em lg: (tela dividida). No celular sobrava só a logo
        pequena solta no topo do layout, sem nenhum texto de boas-vindas.
      */}
      <div className="flex items-center gap-2 lg:hidden">
        <LogoFinds className="h-6 w-auto text-primary" />
        <p className="text-sm font-semibold text-foreground">Bem-vindo(a) ao Finds!</p>
      </div>

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
      <PasswordField
        label="Senha"
        htmlFor="senha"
        autoComplete="new-password"
        error={errors.senha?.message}
        {...register("senha")}
      />
      <PasswordField
        label="Confirmar senha"
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
