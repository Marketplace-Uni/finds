"use client";

import { useActionState } from "react";

import { WizardShell } from "@/src/components/ui/wizard";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { PhotoPicker } from "@/src/components/ui/photo-picker";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import { createListingForm, type ListingFormState } from "@/src/app/actions/listings";

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

  return (
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
        />
        <TextAreaField
          label="Descrição"
          htmlFor="description"
          name="description"
          required
          minLength={20}
          defaultValue={v(state, "description")}
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
        />

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

        <Field label="Categoria" htmlFor="category">
          <select
            id="category"
            name="category"
            className={controlClass}
            defaultValue={v(state, "category") ?? ""}
          >
            <option value="">Selecione...</option>
            {CATEGORIAS.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Modalidade" htmlFor="modality">
          <select
            id="modality"
            name="modality"
            className={controlClass}
            required
            defaultValue={v(state, "modality") ?? ""}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {MODALIDADES.map((modalidade) => (
              <option key={modalidade.value} value={modalidade.value}>
                {modalidade.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Como cobra" htmlFor="price_unit">
          <select
            id="price_unit"
            name="price_unit"
            className={controlClass}
            required
            defaultValue={v(state, "price_unit") ?? ""}
          >
            <option value="" disabled>
              Selecione...
            </option>
            {UNIDADES_PRECO.map((unidade) => (
              <option key={unidade.value} value={unidade.value}>
                {unidade.label}
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
