"use client";

import { useActionState } from "react";

import { cn } from "@/src/lib/utils";
import { WizardShell } from "@/src/components/ui/wizard";
import { Field, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { DateFieldBR } from "@/src/components/ui/date-field-br";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import type { ListingType } from "@/src/lib/listing-details";
import { updateListing, type ListingFormState } from "@/src/app/actions/listings";

const initialState: ListingFormState = {};

type Details = Record<string, unknown>;

function str(details: Details, key: string): string {
  const value = details[key];
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function arr(details: Details, key: string): string[] {
  const value = details[key];
  return Array.isArray(value) ? value.map(String) : [];
}

/**
 * Valor pra pré-preencher um campo: prioriza o que a pessoa acabou de digitar
 * (devolvido pela action quando a edição falha), senão cai pro dado já salvo
 * no anúncio. Sem isso, um erro de validação revertia o formulário pros
 * valores antigos do banco, perdendo a edição que a pessoa tinha acabado de
 * fazer (mesmo problema achado em `/anunciar`, ver PENDENCIAS-KAIKE.md).
 */
function fieldValue(state: ListingFormState, fallback: string, key: string): string {
  const echoed = state.values?.[key];
  return typeof echoed === "string" ? echoed : fallback;
}

function amenidadesMarcadas(state: ListingFormState, details: Details): string[] {
  const echoed = state.values?.amenities;
  if (Array.isArray(echoed)) return echoed;
  if (typeof echoed === "string") return [echoed];
  return arr(details, "amenities");
}

const TITULOS: Record<ListingType, string> = {
  product: "Editar produto",
  service: "Editar serviço",
  roommate: "Editar roommate",
  republic: "Editar república",
};

const CATEGORIAS_PRODUTO = [
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
const CATEGORIAS_SERVICO = ["aulas", "design", "programação", "fotografia", "reparos", "beleza", "outros"];
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
const GENEROS_REPUBLICA = [
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

function AmenidadeChip({ value, label, checked }: { value: string; label: string; checked: boolean }) {
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

export function EditarForm({
  listing,
  campuses,
}: {
  listing: {
    id: string;
    type: ListingType;
    title: string;
    description: string;
    price: number | null;
    campus_id: string | null;
    details: Details;
  };
  campuses: FilterOption[];
}) {
  const action = updateListing.bind(null, listing.id, listing.type);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const d = listing.details;

  return (
    <WizardShell
      title={TITULOS[listing.type]}
      step={1}
      totalSteps={1}
      backHref={`/anuncios/${listing.id}`}
      action={formAction}
      submitLabel={isPending ? "Salvando..." : "Salvar alterações"}
    >
      {/*
        `key` muda a cada erro: força o React a remontar os campos com os
        valores ecoados pela action, em vez de reverter pros dados antigos do
        banco — `defaultValue`/`defaultChecked` sozinhos não bastam pra
        `<select>`/checkbox depois do reset automático que o React faz no fim
        de uma Server Action (ele volta pro valor de quando o campo montou).
      */}
      <div key={state.attempt ?? 0} className="contents">
      <TextField
        label="Título"
        htmlFor="title"
        name="title"
        required
        minLength={5}
        defaultValue={fieldValue(state, listing.title, "title")}
      />
      <TextAreaField
        label="Descrição"
        htmlFor="description"
        name="description"
        required
        minLength={20}
        defaultValue={fieldValue(state, listing.description, "description")}
      />
      {listing.type === "product" || listing.type === "service" ? (
        <TextField
          label="Preço (R$)"
          htmlFor="price"
          name="price"
          type="number"
          min={0}
          step="0.01"
          required
          defaultValue={fieldValue(state, String(listing.price ?? 0), "price")}
        />
      ) : null}

      <Field label="Campus" htmlFor="campus_id">
        <select
          id="campus_id"
          name="campus_id"
          className={controlClass}
          required
          defaultValue={fieldValue(state, listing.campus_id ?? "", "campus_id")}
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

      {listing.type === "product" ? (
        <>
          <Field label="Categoria" htmlFor="category">
            <select
              id="category"
              name="category"
              className={controlClass}
              defaultValue={fieldValue(state, str(d, "category"), "category")}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS_PRODUTO.map((categoria) => (
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
              defaultValue={fieldValue(state, str(d, "condition"), "condition")}
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
            defaultValue={fieldValue(state, str(d, "brand"), "brand")}
          />
        </>
      ) : null}

      {listing.type === "service" ? (
        <>
          <Field label="Categoria" htmlFor="category">
            <select
              id="category"
              name="category"
              className={controlClass}
              defaultValue={fieldValue(state, str(d, "category"), "category")}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS_SERVICO.map((categoria) => (
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
              defaultValue={fieldValue(state, str(d, "modality"), "modality")}
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
              defaultValue={fieldValue(state, str(d, "price_unit"), "price_unit")}
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
        </>
      ) : null}

      {listing.type === "roommate" ? (
        <>
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
                defaultValue={fieldValue(state, str(d, "price_min") || String(listing.price ?? ""), "price_min")}
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
                defaultValue={fieldValue(state, str(d, "price_max") || String(listing.price ?? ""), "price_max")}
                className={controlClass}
              />
            </div>
          </Field>
          <Field label="Modo" htmlFor="mode">
            <select
              id="mode"
              name="mode"
              className={controlClass}
              required
              defaultValue={fieldValue(state, str(d, "mode"), "mode")}
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
              defaultValue={fieldValue(state, str(d, "housing_type"), "housing_type")}
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
            defaultValue={fieldValue(state, str(d, "neighborhood"), "neighborhood")}
          />
          <DateFieldBR
            label="Data de entrada"
            htmlFor="move_in_date"
            name="move_in_date"
            required
            defaultValue={fieldValue(state, str(d, "move_in_date"), "move_in_date")}
          />
          <Field label="Preferência de gênero" htmlFor="gender_preference">
            <select
              id="gender_preference"
              name="gender_preference"
              className={controlClass}
              required
              defaultValue={fieldValue(state, str(d, "gender_preference"), "gender_preference")}
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
        </>
      ) : null}

      {listing.type === "republic" ? (
        <>
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
                defaultValue={fieldValue(state, str(d, "price_min") || String(listing.price ?? ""), "price_min")}
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
                defaultValue={fieldValue(state, str(d, "price_max") || String(listing.price ?? ""), "price_max")}
                className={controlClass}
              />
            </div>
          </Field>
          <TextField
            label="Vagas"
            htmlFor="vacancies"
            name="vacancies"
            type="number"
            min={1}
            required
            defaultValue={fieldValue(state, str(d, "vacancies") || "1", "vacancies")}
          />
          <Field label="Gênero" htmlFor="gender">
            <select
              id="gender"
              name="gender"
              className={controlClass}
              required
              defaultValue={fieldValue(state, str(d, "gender"), "gender")}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {GENEROS_REPUBLICA.map((genero) => (
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
            defaultValue={fieldValue(state, str(d, "neighborhood"), "neighborhood")}
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
                  checked={amenidadesMarcadas(state, d).includes(item.value)}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
      </div>

      <p className="text-xs text-muted-foreground">
        Edição de fotos ainda não disponível aqui — ver PENDENCIAS-KAIKE.md.
      </p>

      {state.error ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}
    </WizardShell>
  );
}
