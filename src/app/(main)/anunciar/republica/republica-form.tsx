"use client";

import { useActionState, useState } from "react";

import { cn } from "@/src/lib/utils";
import { WizardShell } from "@/src/components/ui/wizard";
import { Field, SelectField, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import { ListingPreviewCard } from "@/src/components/listings/listing-preview-card";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";
import { formatPriceRange } from "@/src/lib/listing-details";

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
  onChange,
}: {
  value: string;
  label: string;
  checked: boolean;
  onChange: (value: string, marcado: boolean) => void;
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
        onChange={(e) => onChange(value, e.target.checked)}
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

  const [preview, setPreview] = useState({
    title: v(state, "title") ?? "",
    description: v(state, "description") ?? "",
    priceMin: v(state, "price_min") ?? "",
    priceMax: v(state, "price_max") ?? "",
    campusId: v(state, "campus_id") ?? "",
    vacancies: v(state, "vacancies") ?? "",
    gender: v(state, "gender") ?? "",
    neighborhood: v(state, "neighborhood") ?? "",
    amenities: amenidadesMarcadas(state),
    photos: [] as string[],
  });

  function alternarAmenidade(value: string, marcado: boolean) {
    setPreview((p) => ({
      ...p,
      amenities: marcado ? [...p.amenities, value] : p.amenities.filter((a) => a !== value),
    }));
  }

  const min = Number(preview.priceMin);
  const max = Number(preview.priceMax);
  const campusLabel = campuses.find((campus) => campus.value === preview.campusId)?.label;
  const generoLabel = GENEROS.find((g) => g.value === preview.gender)?.label;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
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

        <TextField
          label="Vagas"
          htmlFor="vacancies"
          name="vacancies"
          type="number"
          min={1}
          required
          defaultValue={v(state, "vacancies")}
          onChange={(e) => setPreview((p) => ({ ...p, vacancies: e.target.value }))}
        />

        <SelectField
          label="Gênero"
          htmlFor="gender"
          name="gender"
          required
          defaultValue={v(state, "gender") ?? ""}
          onChange={(e) => setPreview((p) => ({ ...p, gender: e.target.value }))}
        >
          <option value="" disabled>
            Selecione...
          </option>
          {GENEROS.map((genero) => (
            <option key={genero.value} value={genero.value}>
              {genero.label}
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
                onChange={alternarAmenidade}
              />
            ))}
          </div>
        </div>
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
        type="republic"
        title={preview.title}
        description={preview.description}
        priceLabel={
          Number.isFinite(min) && Number.isFinite(max) && preview.priceMin !== "" && preview.priceMax !== ""
            ? `${formatPriceRange(min, max)} por mês`
            : null
        }
        campusLabel={campusLabel}
        categories={preview.amenities}
        attributes={generoLabel ? [generoLabel] : []}
        specs={[
          preview.neighborhood ? { label: "bairro", value: preview.neighborhood } : null,
          preview.vacancies ? { label: "vagas", value: preview.vacancies } : null,
        ].filter((spec): spec is { label: string; value: string } => spec !== null)}
        photoUrl={preview.photos[0] ?? null}
      />
    </div>
  );
}
