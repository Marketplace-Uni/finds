"use client";

import { useState } from "react";

import { Field, controlClass } from "@/src/components/ui/field";

/** "2026-11-01" -> "01/11/2026". */
function isoToBr(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
}

/** "01/11/2026" -> "2026-11-01"; incompleto vira string vazia. */
function brToIso(br: string): string {
  const match = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
}

/** Deixa só dígitos e insere as barras conforme digita, até 8 dígitos. */
function maskBr(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  const partes = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return partes.join("/");
}

/**
 * Campo de data em dd/mm/aaaa, sempre nesse formato independente do idioma
 * do navegador — o `<input type="date">` nativo exibe no formato do locale
 * do Chrome (não do `lang` da página), o que mostrava mm/dd/aaaa em alguns
 * navegadores mesmo com o site todo em pt-BR.
 *
 * Mantém um input de texto mascarado (o que a pessoa vê e digita) e um input
 * escondido com o valor em ISO (`aaaa-mm-dd`, o formato que o resto do código
 * — `formatMoveInDate()`, o schema — já espera).
 */
export function DateFieldBR({
  label,
  name,
  htmlFor,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  htmlFor: string;
  /** Em ISO (`aaaa-mm-dd`), igual ao que vem de `listings.details`. */
  defaultValue?: string;
  required?: boolean;
}) {
  const [display, setDisplay] = useState(defaultValue ? isoToBr(defaultValue) : "");

  return (
    <Field label={label} htmlFor={htmlFor}>
      <input
        id={htmlFor}
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        autoComplete="off"
        required={required}
        value={display}
        onChange={(event) => setDisplay(maskBr(event.target.value))}
        className={controlClass}
      />
      <input type="hidden" name={name} value={brToIso(display)} />
    </Field>
  );
}
