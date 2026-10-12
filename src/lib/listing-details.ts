import {
  productDetailsSchema,
  republicDetailsSchema,
  roommateDetailsSchema,
  serviceDetailsSchema,
} from "./validations/listings";
import type { Database, Json } from "@/src/types/database";

export type ListingType = Database["public"]["Enums"]["listing_type"];

export type ListingSpec = { label: string; value: string };

export type ListingDisplay = {
  /** Chips com hashtag, para o `categories` do `<ListingDetail>`. */
  categories: string[];
  /** Chips de característica, para o `attributes` do `<ListingDetail>`. */
  attributes: string[];
  specs: ListingSpec[];
  /** "por hora", "por mês"... */
  priceNote: string | null;
};

const EMPTY_DISPLAY: ListingDisplay = {
  categories: [],
  attributes: [],
  specs: [],
  priceNote: null,
};

const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  online: "Online",
  flexivel: "Flexível",
};

const PRICE_UNIT_NOTES: Record<string, string | null> = {
  hora: "por hora",
  projeto: "por projeto",
  diaria: "por diária",
  mensalidade: "por mensalidade",
  "a combinar": null,
};

const ROOMMATE_MODE_LABELS: Record<string, string> = {
  oferece_vaga: "Oferece vaga",
  procura_vaga: "Procura vaga",
};

const HOUSING_TYPE_LABELS: Record<string, string> = {
  apartamento: "Apartamento",
  casa: "Casa",
};

const GENDER_PREFERENCE_LABELS: Record<string, string> = {
  qualquer: "Qualquer",
  feminino: "Feminino",
  masculino: "Masculino",
};

/**
 * "2026-11-01" -> "01/11/2026". Usa `timeZone: "UTC"` porque a data vem sem
 * horário: interpretá-la no fuso local pode "voltar um dia" (meia-noite UTC
 * cai no dia anterior em fusos negativos, como o do Brasil).
 */
function formatMoveInDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Monta `categories`/`attributes`/`specs`/`priceNote` para o `<ListingDetail>`
 * a partir do `details` (jsonb) de um anúncio, validado pelos schemas do
 * Josué em `src/lib/validations/listings.ts` conforme o `type`.
 *
 * Nunca lança: um `details` inválido/antigo (ex.: seed desatualizado) só
 * resulta em menos informação exibida, não em erro na página.
 */
export function buildListingDisplay(type: ListingType, details: Json | null): ListingDisplay {
  switch (type) {
    case "product": {
      const parsed = productDetailsSchema.safeParse(details);
      if (!parsed.success) return EMPTY_DISPLAY;
      const { category, condition, brand } = parsed.data;
      return {
        categories: category ? [category] : [],
        attributes: [condition],
        specs: brand ? [{ label: "Marca", value: brand }] : [],
        priceNote: null,
      };
    }
    case "service": {
      const parsed = serviceDetailsSchema.safeParse(details);
      if (!parsed.success) return EMPTY_DISPLAY;
      const { category, modality, price_unit } = parsed.data;
      return {
        categories: category ? [category] : [],
        attributes: [],
        specs: [{ label: "Modalidade", value: MODALITY_LABELS[modality] ?? modality }],
        priceNote: PRICE_UNIT_NOTES[price_unit] ?? null,
      };
    }
    case "roommate": {
      const parsed = roommateDetailsSchema.safeParse(details);
      if (!parsed.success) return EMPTY_DISPLAY;
      const { mode, housing_type, neighborhood, move_in_date, gender_preference } = parsed.data;
      return {
        categories: [],
        attributes: [],
        specs: [
          { label: "Modo", value: ROOMMATE_MODE_LABELS[mode] ?? mode },
          { label: "Tipo de moradia", value: HOUSING_TYPE_LABELS[housing_type] ?? housing_type },
          { label: "Bairro", value: neighborhood },
          { label: "Data de entrada", value: formatMoveInDate(move_in_date) },
          {
            label: "Preferência de gênero",
            value: GENDER_PREFERENCE_LABELS[gender_preference] ?? gender_preference,
          },
        ],
        priceNote: null,
      };
    }
    case "republic": {
      const parsed = republicDetailsSchema.safeParse(details);
      if (!parsed.success) return EMPTY_DISPLAY;
      const { vacancies, gender, neighborhood, amenities } = parsed.data;
      return {
        categories: amenities,
        attributes: [gender],
        specs: [
          { label: "Vagas", value: String(vacancies) },
          { label: "Bairro", value: neighborhood },
        ],
        priceNote: null,
      };
    }
    default:
      return EMPTY_DISPLAY;
  }
}
