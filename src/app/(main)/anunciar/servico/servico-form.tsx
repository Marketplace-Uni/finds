"use client";

import { useActionState, useState } from "react";

import { WizardShell } from "@/src/components/ui/wizard";
import { SelectField, TextAreaField, TextField } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import { ListingPreviewCard } from "@/src/components/listings/listing-preview-card";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";
import { formatPrice } from "@/src/lib/format";

const initialState: ListingFormState = {};
const criarAnuncio = createListingForm.bind(null, "service");

const CATEGORIAS = ["aulas", "design", "programação", "fotografia", "reparos", "beleza", "outros"];

const MODALIDADES = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "flexivel", label: "Flexível" },
];

const UNIDADES_PRECO = [
  { value: "hora", label: "Por hora" },
  { value: "projeto", label: "Por projeto" },
  { value: "diaria", label: "Por diária" },
  { value: "mensalidade", label: "Mensalidade" },
  { value: "a combinar", label: "A combinar" },
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

export function ServicoForm({ campuses }: { campuses: FilterOption[] }) {
  const [state, formAction, isPending] = useActionState(criarAnuncio, initialState);

  const [preview, setPreview] = useState({
    title: v(state, "title") ?? "",
    description: v(state, "description") ?? "",
    price: v(state, "price") ?? "",
    campusId: v(state, "campus_id") ?? "",
    category: v(state, "category") ?? "",
    modality: v(state, "modality") ?? "",
    priceUnit: v(state, "price_unit") ?? "",
    photos: [] as string[],
  });

  const precoNumero = Number(preview.price);
  const campusLabel = campuses.find((campus) => campus.value === preview.campusId)?.label;
  const modalidadeLabel = MODALIDADES.find((m) => m.value === preview.modality)?.label;
  const unidadeLabel = UNIDADES_PRECO.find((u) => u.value === preview.priceUnit)?.label;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <WizardShell
        title="Anunciar serviço"
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
          <TextField
            label="Preço (R$)"
            htmlFor="price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={v(state, "price")}
            onChange={(e) => setPreview((p) => ({ ...p, price: e.target.value }))}
          />

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
            label="Categoria"
            htmlFor="category"
            name="category"
            defaultValue={v(state, "category") ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, category: e.target.value }))}
          >
            <option value="">Selecione...</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Modalidade"
            htmlFor="modality"
            name="modality"
            required
            defaultValue={v(state, "modality") ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, modality: e.target.value }))}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {MODALIDADES.map((modalidade) => (
              <option key={modalidade.value} value={modalidade.value}>
                {modalidade.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Como cobra"
            htmlFor="price_unit"
            name="price_unit"
            required
            defaultValue={v(state, "price_unit") ?? ""}
            onChange={(e) => setPreview((p) => ({ ...p, priceUnit: e.target.value }))}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {UNIDADES_PRECO.map((unidade) => (
              <option key={unidade.value} value={unidade.value}>
                {unidade.label}
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
        type="service"
        title={preview.title}
        description={preview.description}
        priceLabel={
          Number.isFinite(precoNumero) && preview.price !== ""
            ? `${formatPrice(precoNumero)}${unidadeLabel ? ` ${unidadeLabel.toLowerCase()}` : ""}`
            : null
        }
        campusLabel={campusLabel}
        categories={preview.category ? [preview.category] : []}
        specs={modalidadeLabel ? [{ label: "modalidade", value: modalidadeLabel }] : []}
        photoUrl={preview.photos[0] ?? null}
      />
    </div>
  );
}
