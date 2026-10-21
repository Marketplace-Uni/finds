"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { TextField } from "@/src/components/ui/field";
import { PasswordField } from "@/src/components/ui/password-field";
import { entrarSchema, type EntrarInput } from "@/src/lib/validations/auth";
import { entrar } from "./actions";

/**
 * `next` vem pronto do `page.tsx` (Server Component, lê `searchParams`) —
 * antes este componente lia com `useSearchParams()`, o que obrigava a
 * embrulhar tudo num `<Suspense>` sem `fallback`. Numa página 100% estática
 * como esta, isso faz o HTML da build já nascer sem o formulário nenhum (só
 * o que está fora do Suspense, ex. a logo do layout) — ele só aparece depois
 * que o JS hidrata no cliente. Se a hidratação atrasar ou falhar por
 * qualquer motivo (rede lenta, erro silencioso em produção), a tela fica
 * em branco, sem nenhum input, até isso resolver — foi o que aconteceu num
 * iPhone com iOS 16.1.1 (Safari e Chrome, que usa o mesmo motor WebKit no
 * iOS), em todo navegador testado. Recebendo `next` por prop, o formulário
 * inteiro já vem pronto no HTML estático — aparece na hora, mesmo antes do
 * JS carregar; só o clique em "Entrar" depende de JS, como qualquer form.
 */
export function EntrarForm({ next }: { next?: string }) {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
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
      <PasswordField
        label="Senha"
        htmlFor="senha"
        autoComplete="current-password"
        error={errors.senha?.message}
        {...register("senha")}
      />

      <Link
        href="/recuperar-senha"
        className="-mt-3 self-end text-xs font-semibold text-primary hover:underline"
      >
        Esqueceu a senha?
      </Link>

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

      <p className="text-center text-sm text-muted-foreground">
        Só quer testar?{" "}
        <Link href="/como-testar" className="font-semibold text-primary">
          Use uma conta de demonstração
        </Link>
      </p>
    </form>
  );
}
