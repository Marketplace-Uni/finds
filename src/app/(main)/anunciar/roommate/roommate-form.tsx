"use client";

import { useActionState, useState } from "react";

import { WizardShell } from "@/src/components/ui/wizard";
import { Field, SelectField, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { DateFieldBR } from "@/src/components/ui/date-field-br";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import { ListingPreviewCard } from "@/src/components/listings/listing-preview-card";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";
import { formatPriceRange } from "@/src/lib/listing-details";

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

  const [preview, setPreview] = useState({
    title: v(state, "title") ?? "",
    description: v(state, "description") ?? "",
    priceMin: v(state, "price_min") ?? "",
    priceMax: v(state, "price_max") ?? "",
    campusId: v(state, "campus_id") ?? "",
    mode: v(state, "mode") ?? "",
    housingType: v(state, "housing_type") ?? "",
    neighborhood: v(state, "neighborhood") ?? "",
    genderPreference: v(state, "gender_preference") ?? "",
    photos: [] as string[],
  });

  const min = Number(preview.priceMin);
  const max = Number(preview.priceMax);
  const campusLabel = campuses.find((campus) => campus.value === preview.campusId)?.label;
  const modoLabel = MODOS.find((m) => m.value === preview.mode)?.label;
  const moradiaLabel = TIPOS_MORADIA.find((t) => t.value === preview.housingType)?.label;
  const generoLabel = PREFERENCIAS_GENERO.find((g) => g.value === preview.genderPreference)?.label;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
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
          onChange={(e) => setPreview((p) => ({ ...p, title: e.target.value }))}
        />
        <TextAreaField
          label="Descrição"
          htmlFor="description"
          name="description"
          required
          minLength={20}
          defaultValue={v(state, "description")}
          onChange={(e) => setPreview((p) => ({ ...p, description: e.target.value }))}
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
              onChange={(e) => setPreview((p) => ({ ...p, priceMin: e.target.value }))}
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
              onChange={(e) => setPreview((p) => ({ ...p, priceMax: e.target.value }))}
            />
          </div>
        </Field>

        <SelectField
          label="Campus"
          htmlFor="campus_id"
          name="campus_id"
          required
          defaultValue={v(state, "campus_id") ?? ""}
          onChange={(e) => setPreview((p) => ({ ...p, campusId: e.target.value }))}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {campuses.map((campus) => (
            <option key={campus.value} value={campus.value}>
              {campus.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Modo"
          htmlFor="mode"
          name="mode"
          required
          defaultValue={v(state, "mode") ?? ""}
          onChange={(e) => setPreview((p) => ({ ...p, mode: e.target.value }))}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {MODOS.map((modo) => (
            <option key={modo.value} value={modo.value}>
              {modo.label}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Tipo de moradia"
          htmlFor="housing_type"
          name="housing_type"
          required
          defaultValue={v(state, "housing_type") ?? ""}
          onChange={(e) => setPreview((p) => ({ ...p, housingType: e.target.value }))}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {TIPOS_MORADIA.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </SelectField>

        <TextField
          label="Bairro"
          htmlFor="neighborhood"
          name="neighborhood"
          required
          minLength={2}
          defaultValue={v(state, "neighborhood")}
          onChange={(e) => setPreview((p) => ({ ...p, neighborhood: e.target.value }))}
        />

        <DateFieldBR
          label="Data de entrada"
          htmlFor="move_in_date"
          name="move_in_date"
          required
          defaultValue={v(state, "move_in_date")}
        />

        <SelectField
          label="Preferência de gênero"
          htmlFor="gender_preference"
          name="gender_preference"
          required
          defaultValue={v(state, "gender_preference") ?? ""}
          onChange={(e) => setPreview((p) => ({ ...p, genderPreference: e.target.value }))}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {PREFERENCIAS_GENERO.map((preferencia) => (
            <option key={preferencia.value} value={preferencia.value}>
              {preferencia.label}
            </option>
          ))}
        </SelectField>
        </div>

        <PhotoPicker
          name="images"
          onPhotosChange={(urls) => setPreview((p) => ({ ...p, photos: urls }))}
        />

        {state.error ? (
          <p className="text-xs font-medium text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}
      </WizardShell>

      <ListingPreviewCard
        className="lg:sticky lg:top-24"
        type="roommate"
        title={preview.title}
        description={preview.description}
        priceLabel={
          Number.isFinite(min) && Number.isFinite(max) && preview.priceMin !== "" && preview.priceMax !== ""
            ? `${formatPriceRange(min, max)} por mês`
            : null
        }
        campusLabel={campusLabel}
        attributes={[modoLabel, moradiaLabel].filter((v): v is string => Boolean(v))}
        specs={[
          preview.neighborhood ? { label: "bairro", value: preview.neighborhood } : null,
          generoLabel ? { label: "gênero", value: generoLabel } : null,
        ].filter((spec): spec is { label: string; value: string } => spec !== null)}
        photoUrl={preview.photos[0] ?? null}
      />
    </div>
  );
}
