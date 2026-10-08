"use client";

import { useActionState, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import type { Profile } from "@/src/lib/auth";
import { editarPerfil, type EditarPerfilState } from "./actions";

const initialState: EditarPerfilState = {};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function EditarPerfilForm({
  profile,
  campuses,
}: {
  profile: Profile;
  campuses: FilterOption[];
}) {
  const [state, formAction, isPending] = useActionState(editarPerfil, initialState);
  const [preview, setPreview] = useState<string | null>(profile.avatar_url);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Avatar size="lg" className="size-20 border-2 border-secondary">
          <AvatarImage src={preview ?? undefined} alt="" />
          <AvatarFallback className="text-lg font-semibold text-foreground">
            {initials(profile.full_name ?? profile.username ?? "?")}
          </AvatarFallback>
        </Avatar>

        <label className="cursor-pointer text-sm font-semibold text-primary hover:underline">
          Trocar foto
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />
        </label>
      </div>

      <TextField
        label="Nome"
        htmlFor="fullName"
        name="fullName"
        defaultValue={profile.full_name ?? ""}
      />

      <TextAreaField
        label="Bio"
        htmlFor="bio"
        name="bio"
        defaultValue={profile.bio ?? ""}
        hint="Até 280 caracteres."
      />

      <Field label="Campus" htmlFor="campusId">
        <select
          id="campusId"
          name="campusId"
          className={controlClass}
          defaultValue={profile.campus_id ?? ""}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {campuses.map((campus) => (
            <option key={campus.value} value={campus.value}>
              {campus.label}
            </option>
          ))}
        </select>
      </Field>

      {state.error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-xs font-medium text-primary">Perfil atualizado!</p>
      ) : null}

      <Button type="submit" className="w-fit rounded-pill px-8" disabled={isPending}>
        Salvar alterações
      </Button>
    </form>
  );
}
