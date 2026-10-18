"use client";

import { useActionState } from "react";

import { cn } from "@/src/lib/utils";
import { WizardShell } from "@/src/components/ui/wizard";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";

const initialState: ListingFormState = {};
const criarAnuncio = createListingForm.bind(null, "republic");

const GENEROS = [
  { value: "feminina", label: "Feminina" },
  { value: "masculina", label: "Masculina" },
  { value: "mista", label: "Mista" },
];

const AMENIDADES = [
  { value: "wifi", label: "Wi-Fi" },
  { value: "mobiliada", label: "Mobiliada" },
  { value: "garagem", label: "Garagem" },
  { value: "lavanderia", label: "Lavanderia" },
  { value: "contas inclusas", label: "Contas inclusas" },
];

/**
 * Valor que a pessoa já tinha digitado nesse campo, devolvido pela action
 * quando dá erro — sem isso, um erro de validação ou de upload apagava tudo
 * que já tinha sido preenchido (achado testando o fluxo de /anunciar).
 */
function v(state: ListingFormState, key: string): string | undefined {
  const value = state.values?.[key];
  return typeof value === "string" ? value : undefined;
}

function amenidadesMarcadas(state: ListingFormState): string[] {
  const value = state.values?.amenities;
  if (Array.isArray(value)) return value;
  return typeof value === "string" ? [value] : [];
}

/** Mesmo padrão de chip selecionável do `<ConvivenciaPicker>` (ver docs/DESIGN.md). */
function AmenidadeChip({
  value,
  label,
  checked,
}: {
  value: string;
  label: string;
  checked: boolean;
}) {
  const id = `amenities-${value}`;
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        name="amenities"
        value={value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "inline-flex cursor-pointer items-center rounded-pill px-3 py-1.5 text-sm font-semibold",
          "bg-muted text-foreground transition-colors hover:bg-primary/60 hover:text-primary-foreground",
          "peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        )}
      >
        {label}
      </label>
    </div>
  );
}

export function RepublicaForm({ campuses }: { campuses: FilterOption[] }) {
  const [state, formAction, isPending] = useActionState(criarAnuncio, initialState);

  return (
    <WizardShell
      title="Anunciar república"
      step={1}
      totalSteps={1}
      backHref="/anunciar"
      action={formAction}
      submitLabel={isPending ? "Publicando..." : "Publicar anúncio"}
      secondaryAction={
        <button
          type="submit"
          name="status"
          value="draft"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          Salvar como rascunho
        </button>
      }
    >
      {/*
        `key` muda a cada erro: força o React a remontar os campos com os
        valores ecoados pela action. Só `defaultValue` não bastava pros
        `<select>`/checkbox — o reset automático do React depois de uma
        Server Action volta pro valor de quando o campo montou, não para um
        `defaultValue`/`defaultChecked` atualizado (funcionava para `<input>`
        de texto, não para esses).
      */}
      <div key={state.attempt ?? 0} className="contents">
      <TextField
        label="Título"
        htmlFor="title"
        name="title"
        required
        minLength={5}
        defaultValue={v(state, "title")}
      />
      <TextAreaField
        label="Descrição"
        htmlFor="description"
        name="description"
        required
        minLength={20}
        defaultValue={v(state, "description")}
      />
      <Field
        label="Faixa de preço (R$)"
        htmlFor="price_min"
        hint="Quanto cada vaga custa por mês — pode ser uma faixa, se variar."
      >
        <div className="flex items-center gap-2">
          <label htmlFor="price_min" className="sr-only">
            Preço mínimo
          </label>
          <input
            id="price_min"
            name="price_min"
            type="number"
            min={0}
            step="0.01"
            placeholder="De"
            required
            defaultValue={v(state, "price_min")}
            className={controlClass}
          />
          <span className="shrink-0 text-sm text-muted-foreground">até</span>
          <label htmlFor="price_max" className="sr-only">
            Preço máximo
          </label>
          <input
            id="price_max"
            name="price_max"
            type="number"
            min={0}
            step="0.01"
            placeholder="Até"
            required
            defaultValue={v(state, "price_max")}
            className={controlClass}
          />
        </div>
      </Field>

      <Field label="Campus" htmlFor="campus_id">
        <select
          id="campus_id"
          name="campus_id"
          className={controlClass}
          required
          defaultValue={v(state, "campus_id") ?? ""}
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

      <TextField
        label="Vagas"
        htmlFor="vacancies"
        name="vacancies"
        type="number"
        min={1}
        required
        defaultValue={v(state, "vacancies")}
      />

      <Field label="Gênero" htmlFor="gender">
        <select
          id="gender"
          name="gender"
          className={controlClass}
          required
          defaultValue={v(state, "gender") ?? ""}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {GENEROS.map((genero) => (
            <option key={genero.value} value={genero.value}>
              {genero.label}
            </option>
          ))}
        </select>
      </Field>

      <TextField
        label="Bairro"
        htmlFor="neighborhood"
        name="neighborhood"
        required
        minLength={2}
        defaultValue={v(state, "neighborhood")}
      />

      <div className="flex flex-col gap-1.5">
        <span className="inline-flex w-fit rounded-md bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
          Comodidades
        </span>
        <div className="flex flex-wrap gap-2">
          {AMENIDADES.map((item) => (
            <AmenidadeChip
              key={item.value}
              value={item.value}
              label={item.label}
              checked={amenidadesMarcadas(state).includes(item.value)}
            />
          ))}
        </div>
      </div>
      </div>

      <PhotoPicker name="images" />

      {state.error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </WizardShell>
  );
}
