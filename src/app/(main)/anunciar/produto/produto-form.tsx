"use client";

import { useActionState, useState } from "react";

import { WizardShell } from "@/src/components/ui/wizard";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import { ListingPreviewCard } from "@/src/components/listings/listing-preview-card";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";
import { formatPrice } from "@/src/lib/format";

const initialState: ListingFormState = {};
const criarAnuncio = createListingForm.bind(null, "product");

const CATEGORIAS = [
  "livros",
  "eletrônicos",
  "móveis",
  "eletrodomésticos",
  "roupas",
  "material de estudo",
  "outros",
];

const CONDICOES = [
  { value: "novo", label: "Novo" },
  { value: "seminovo", label: "Seminovo" },
  { value: "usado", label: "Usado" },
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

export function ProdutoForm({ campuses }: { campuses: FilterOption[] }) {
  const [state, formAction, isPending] = useActionState(criarAnuncio, initialState);

  const [preview, setPreview] = useState({
    title: v(state, "title") ?? "",
    description: v(state, "description") ?? "",
    price: v(state, "price") ?? "",
    campusId: v(state, "campus_id") ?? "",
    category: v(state, "category") ?? "",
    condition: v(state, "condition") ?? "",
    brand: v(state, "brand") ?? "",
    photos: [] as string[],
  });

  const precoNumero = Number(preview.price);
  const campusLabel = campuses.find((campus) => campus.value === preview.campusId)?.label;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <WizardShell
        title="Anunciar produto"
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

          <Field label="Campus" htmlFor="campus_id">
            <select
              id="campus_id"
              name="campus_id"
              className={controlClass}
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
            </select>
          </Field>

          <Field label="Categoria" htmlFor="category">
            <select
              id="category"
              name="category"
              className={controlClass}
              defaultValue={v(state, "category") ?? ""}
              onChange={(e) => setPreview((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Condição" htmlFor="condition">
            <select
              id="condition"
              name="condition"
              className={controlClass}
              required
              defaultValue={v(state, "condition") ?? ""}
              onChange={(e) => setPreview((p) => ({ ...p, condition: e.target.value }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {CONDICOES.map((condicao) => (
                <option key={condicao.value} value={condicao.value}>
                  {condicao.label}
                </option>
              ))}
            </select>
          </Field>

          <TextField
            label="Marca (opcional)"
            htmlFor="brand"
            name="brand"
            defaultValue={v(state, "brand")}
            onChange={(e) => setPreview((p) => ({ ...p, brand: e.target.value }))}
          />
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
        type="product"
        title={preview.title}
        description={preview.description}
        priceLabel={Number.isFinite(precoNumero) && preview.price !== "" ? formatPrice(precoNumero) : null}
        campusLabel={campusLabel}
        categories={preview.category ? [preview.category] : []}
        attributes={preview.condition ? [CONDICOES.find((c) => c.value === preview.condition)?.label ?? preview.condition] : []}
        specs={preview.brand ? [{ label: "marca", value: preview.brand }] : []}
        photoUrl={preview.photos[0] ?? null}
      />
    </div>
  );
}
