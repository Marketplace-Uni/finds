"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/components/ui/button";
import { Field, controlClass } from "@/src/components/ui/field";
import {
  completarPerfilSchema,
  type CompletarPerfilInput,
} from "@/src/lib/validations/profile";
import { completarPerfil } from "./actions";

export type CampusOption = { id: string; label: string };

export function CompletarPerfilForm({
  campuses,
  next,
}: {
  campuses: CampusOption[];
  next?: string;
}) {
  const [erroServidor, setErroServidor] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CompletarPerfilInput>({
    resolver: zodResolver(completarPerfilSchema),
    defaultValues: { next },
  });

  async function onSubmit(data: CompletarPerfilInput) {
    setErroServidor(null);
    const resultado = await completarPerfil(data);
    if (resultado.error) setErroServidor(resultado.error);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <h1 className="text-xl font-semibold text-foreground">Complete seu perfil</h1>
      <p className="text-sm text-muted-foreground">
        Só falta escolher o seu campus para liberar o Finds.
      </p>

      <input type="hidden" {...register("next")} />

      <Field label="Campus" htmlFor="campusId" error={errors.campusId?.message}>
        <select id="campusId" className={controlClass} defaultValue="" {...register("campusId")}>
          <option value="" disabled>
            Selecione...
          </option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.label}
            </option>
          ))}
        </select>
      </Field>

      {erroServidor ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {erroServidor}
        </p>
      ) : null}

      <Button type="submit" className="rounded-pill" disabled={isSubmitting}>
        Continuar
      </Button>
    </form>
  );
}
