import type { ReactNode } from "react";

import { cn } from "@/src/lib/utils";

/** Classe dos controles do Finds: fundo creme-escuro e cantos bem arredondados. */
export const controlClass =
  "w-full rounded-md bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

type FieldProps = {
  label: string;
  htmlFor: string;
  /** Texto de apoio abaixo do campo. */
  hint?: string;
  /** Mensagem de erro; substitui o hint e marca o campo. */
  error?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Campo de formulário do Finds. O rótulo é uma **pílula laranja** acima do
 * controle, como nos wizards do Figma — não um label solto.
 */
export function Field({ label, htmlFor, hint, error, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="inline-flex w-fit rounded-md bg-primary px-4 py-1 text-xs font-medium text-primary-foreground"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="px-1 text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="px-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type TextFieldProps = Omit<FieldProps, "children"> &
  Omit<React.ComponentProps<"input">, "id" | "className">;

export function TextField({
  label,
  htmlFor,
  hint,
  error,
  className,
  ...inputProps
}: TextFieldProps) {
  return (
    <Field label={label} htmlFor={htmlFor} hint={hint} error={error} className={className}>
      <input
        id={htmlFor}
        aria-invalid={error ? true : undefined}
        className={controlClass}
        {...inputProps}
      />
    </Field>
  );
}

type TextAreaFieldProps = Omit<FieldProps, "children"> &
  Omit<React.ComponentProps<"textarea">, "id" | "className">;

export function TextAreaField({
  label,
  htmlFor,
  hint,
  error,
  className,
  rows = 6,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <Field label={label} htmlFor={htmlFor} hint={hint} error={error} className={className}>
      <textarea
        id={htmlFor}
        rows={rows}
        aria-invalid={error ? true : undefined}
        className={cn(controlClass, "resize-y")}
        {...textareaProps}
      />
    </Field>
  );
}
