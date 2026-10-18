"use client";

import { useActionState } from "react";

import { WizardShell } from "@/src/components/ui/wizard";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { DateFieldBR } from "@/src/components/ui/date-field-br";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";

const initialState: ListingFormState = {};
const criarAnuncio = createListingForm.bind(null, "roommate");

const MODOS = [
  { value: "oferece_vaga", label: "Ofereço vaga" },
  { value: "procura_vaga", label: "Procuro vaga" },
];

const TIPOS_MORADIA = [
  { value: "apartamento", label: "Apartamento" },
  { value: "casa", label: "Casa" },
];

const PREFERENCIAS_GENERO = [
  { value: "qualquer", label: "Qualquer" },
  { value: "feminino", label: "Feminino" },
  { value: "masculino", label: "Masculino" },
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

export function RoommateForm({ campuses }: { campuses: FilterOption[] }) {
  const [state, formAction, isPending] = useActionState(criarAnuncio, initialState);

  return (
    <WizardShell
      title="Anunciar roommate"
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
        `<select>` — o reset automático do React depois de uma Server Action
        volta pro valor de quando o campo montou, não para um `defaultValue`
        atualizado (funcionava para `<input>` de texto, não para `<select>`).
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
        hint="Quanto você está disposto a pagar ou pedir por mês."
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

      <Field label="Modo" htmlFor="mode">
        <select
          id="mode"
          name="mode"
          className={controlClass}
          required
          defaultValue={v(state, "mode") ?? ""}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {MODOS.map((modo) => (
            <option key={modo.value} value={modo.value}>
              {modo.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tipo de moradia" htmlFor="housing_type">
        <select
          id="housing_type"
          name="housing_type"
          className={controlClass}
          required
          defaultValue={v(state, "housing_type") ?? ""}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {TIPOS_MORADIA.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
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

      <DateFieldBR
        label="Data de entrada"
        htmlFor="move_in_date"
        name="move_in_date"
        required
        defaultValue={v(state, "move_in_date")}
      />

      <Field label="Preferência de gênero" htmlFor="gender_preference">
        <select
          id="gender_preference"
          name="gender_preference"
          className={controlClass}
          required
          defaultValue={v(state, "gender_preference") ?? ""}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {PREFERENCIAS_GENERO.map((preferencia) => (
            <option key={preferencia.value} value={preferencia.value}>
              {preferencia.label}
            </option>
          ))}
        </select>
      </Field>
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
