"use client";

import { useActionState, useState } from "react";

import { cn } from "@/src/lib/utils";
import { WizardShell } from "@/src/components/ui/wizard";
import { Field, SelectField, TextAreaField, TextField, controlClass } from "@/src/components/ui/field";
import { DateFieldBR } from "@/src/components/ui/date-field-br";
import { EditImagesField } from "@/src/components/listings/edit-images-field";
import { ListingPreviewCard } from "@/src/components/listings/listing-preview-card";
import type { FilterOption } from "@/src/components/discovery/filters-sidebar";
import type { ListingType } from "@/src/lib/listing-details";
import { formatPriceRange } from "@/src/lib/listing-details";
import { updateListing, type ListingFormState } from "@/src/app/actions/listings";
import { formatPrice } from "@/src/lib/format";

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
    images: { path: string; url: string }[];
  };
  campuses: FilterOption[];
}) {
  const action = updateListing.bind(null, listing.id, listing.type);
  const [state, formAction, isPending] = useActionState(action, initialState);
  const d = listing.details;

  // Estado da prévia ao vivo — mesmo padrão dos 4 formulários de /anunciar,
  // só que seedado com os dados atuais do anúncio em vez de campos vazios.
  const [preview, setPreview] = useState({
    title: fieldValue(state, listing.title, "title"),
    description: fieldValue(state, listing.description, "description"),
    price: fieldValue(state, String(listing.price ?? ""), "price"),
    campusId: fieldValue(state, listing.campus_id ?? "", "campus_id"),
    category: fieldValue(state, str(d, "category"), "category"),
    condition: fieldValue(state, str(d, "condition"), "condition"),
    brand: fieldValue(state, str(d, "brand"), "brand"),
    modality: fieldValue(state, str(d, "modality"), "modality"),
    priceUnit: fieldValue(state, str(d, "price_unit"), "price_unit"),
    priceMin: fieldValue(state, str(d, "price_min") || String(listing.price ?? ""), "price_min"),
    priceMax: fieldValue(state, str(d, "price_max") || String(listing.price ?? ""), "price_max"),
    mode: fieldValue(state, str(d, "mode"), "mode"),
    housingType: fieldValue(state, str(d, "housing_type"), "housing_type"),
    neighborhood: fieldValue(state, str(d, "neighborhood"), "neighborhood"),
    genderPreference: fieldValue(state, str(d, "gender_preference"), "gender_preference"),
    gender: fieldValue(state, str(d, "gender"), "gender"),
    vacancies: fieldValue(state, str(d, "vacancies") || "1", "vacancies"),
    amenities: amenidadesMarcadas(state, d),
    photos: listing.images.map((image) => image.url),
  });

  function alternarAmenidade(value: string, marcado: boolean) {
    setPreview((p) => ({
      ...p,
      amenities: marcado ? [...p.amenities, value] : p.amenities.filter((a) => a !== value),
    }));
  }

  const campusLabel = campuses.find((campus) => campus.value === preview.campusId)?.label;
  const precoNumero = Number(preview.price);
  const min = Number(preview.priceMin);
  const max = Number(preview.priceMax);
  const condicaoLabel = CONDICOES.find((c) => c.value === preview.condition)?.label;
  const modalidadeLabel = MODALIDADES.find((m) => m.value === preview.modality)?.label;
  const unidadeLabel = UNIDADES_PRECO.find((u) => u.value === preview.priceUnit)?.label;
  const modoLabel = MODOS.find((m) => m.value === preview.mode)?.label;
  const moradiaLabel = TIPOS_MORADIA.find((t) => t.value === preview.housingType)?.label;
  const generoPreferenciaLabel = PREFERENCIAS_GENERO.find((g) => g.value === preview.genderPreference)?.label;
  const generoRepublicaLabel = GENEROS_REPUBLICA.find((g) => g.value === preview.gender)?.label;

  let priceLabel: string | null = null;
  let categories: string[] = [];
  let attributes: string[] = [];
  let specs: { label: string; value: string }[] = [];

  if (listing.type === "product") {
    priceLabel = Number.isFinite(precoNumero) && preview.price !== "" ? formatPrice(precoNumero) : null;
    categories = preview.category ? [preview.category] : [];
    attributes = condicaoLabel ? [condicaoLabel] : [];
    specs = preview.brand ? [{ label: "marca", value: preview.brand }] : [];
  } else if (listing.type === "service") {
    priceLabel =
      Number.isFinite(precoNumero) && preview.price !== ""
        ? `${formatPrice(precoNumero)}${unidadeLabel ? ` ${unidadeLabel.toLowerCase()}` : ""}`
        : null;
    categories = preview.category ? [preview.category] : [];
    specs = modalidadeLabel ? [{ label: "modalidade", value: modalidadeLabel }] : [];
  } else if (listing.type === "roommate") {
    priceLabel =
      Number.isFinite(min) && Number.isFinite(max) && preview.priceMin !== "" && preview.priceMax !== ""
        ? `${formatPriceRange(min, max)} por mês`
        : null;
    attributes = [modoLabel, moradiaLabel].filter((v): v is string => Boolean(v));
    specs = [
      preview.neighborhood ? { label: "bairro", value: preview.neighborhood } : null,
      generoPreferenciaLabel ? { label: "gênero", value: generoPreferenciaLabel } : null,
    ].filter((spec): spec is { label: string; value: string } => spec !== null);
  } else if (listing.type === "republic") {
    priceLabel =
      Number.isFinite(min) && Number.isFinite(max) && preview.priceMin !== "" && preview.priceMax !== ""
        ? `${formatPriceRange(min, max)} por mês`
        : null;
    categories = preview.amenities;
    attributes = generoRepublicaLabel ? [generoRepublicaLabel] : [];
    specs = [
      preview.neighborhood ? { label: "bairro", value: preview.neighborhood } : null,
      preview.vacancies ? { label: "vagas", value: preview.vacancies } : null,
    ].filter((spec): spec is { label: string; value: string } => spec !== null);
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
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
          onChange={(e) => setPreview((p) => ({ ...p, title: e.target.value }))}
        />
        <TextAreaField
          label="Descrição"
          htmlFor="description"
          name="description"
          required
          minLength={20}
          defaultValue={fieldValue(state, listing.description, "description")}
          onChange={(e) => setPreview((p) => ({ ...p, description: e.target.value }))}
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
            onChange={(e) => setPreview((p) => ({ ...p, price: e.target.value }))}
          />
        ) : null}

        <SelectField
          label="Campus"
          htmlFor="campus_id"
          name="campus_id"
          required
          defaultValue={fieldValue(state, listing.campus_id ?? "", "campus_id")}
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

        {listing.type === "product" ? (
          <>
            <SelectField
              label="Categoria"
              htmlFor="category"
              name="category"
              defaultValue={fieldValue(state, str(d, "category"), "category")}
              onChange={(e) => setPreview((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS_PRODUTO.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </SelectField>
            <SelectField
              label="Condição"
              htmlFor="condition"
              name="condition"
              required
              defaultValue={fieldValue(state, str(d, "condition"), "condition")}
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
            </SelectField>
            <TextField
              label="Marca (opcional)"
              htmlFor="brand"
              name="brand"
              defaultValue={fieldValue(state, str(d, "brand"), "brand")}
              onChange={(e) => setPreview((p) => ({ ...p, brand: e.target.value }))}
            />
          </>
        ) : null}

        {listing.type === "service" ? (
          <>
            <SelectField
              label="Categoria"
              htmlFor="category"
              name="category"
              defaultValue={fieldValue(state, str(d, "category"), "category")}
              onChange={(e) => setPreview((p) => ({ ...p, category: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {CATEGORIAS_SERVICO.map((categoria) => (
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
              defaultValue={fieldValue(state, str(d, "modality"), "modality")}
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
              defaultValue={fieldValue(state, str(d, "price_unit"), "price_unit")}
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
                  defaultValue={fieldValue(state, str(d, "price_max") || String(listing.price ?? ""), "price_max")}
                  className={controlClass}
                  onChange={(e) => setPreview((p) => ({ ...p, priceMax: e.target.value }))}
                />
              </div>
            </Field>
            <SelectField
              label="Modo"
              htmlFor="mode"
              name="mode"
              required
              defaultValue={fieldValue(state, str(d, "mode"), "mode")}
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
              defaultValue={fieldValue(state, str(d, "housing_type"), "housing_type")}
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
              defaultValue={fieldValue(state, str(d, "neighborhood"), "neighborhood")}
              onChange={(e) => setPreview((p) => ({ ...p, neighborhood: e.target.value }))}
            />
            <DateFieldBR
              label="Data de entrada"
              htmlFor="move_in_date"
              name="move_in_date"
              required
              defaultValue={fieldValue(state, str(d, "move_in_date"), "move_in_date")}
            />
            <SelectField
              label="Preferência de gênero"
              htmlFor="gender_preference"
              name="gender_preference"
              required
              defaultValue={fieldValue(state, str(d, "gender_preference"), "gender_preference")}
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
                  defaultValue={fieldValue(state, str(d, "price_max") || String(listing.price ?? ""), "price_max")}
                  className={controlClass}
                  onChange={(e) => setPreview((p) => ({ ...p, priceMax: e.target.value }))}
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
              onChange={(e) => setPreview((p) => ({ ...p, vacancies: e.target.value }))}
            />
            <SelectField
              label="Gênero"
              htmlFor="gender"
              name="gender"
              required
              defaultValue={fieldValue(state, str(d, "gender"), "gender")}
              onChange={(e) => setPreview((p) => ({ ...p, gender: e.target.value }))}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {GENEROS_REPUBLICA.map((genero) => (
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
              defaultValue={fieldValue(state, str(d, "neighborhood"), "neighborhood")}
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
                    checked={amenidadesMarcadas(state, d).includes(item.value)}
                    onChange={alternarAmenidade}
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
        </div>

        <EditImagesField
          initialImages={listing.images}
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
        type={listing.type}
        title={preview.title}
        description={preview.description}
        priceLabel={priceLabel}
        campusLabel={campusLabel}
        categories={categories}
        attributes={attributes}
        specs={specs}
        photoUrl={preview.photos[0] ?? null}
      />
    </div>
  );
}
