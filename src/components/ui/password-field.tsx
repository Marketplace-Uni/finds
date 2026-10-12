"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Field, controlClass } from "@/src/components/ui/field";
import { cn } from "@/src/lib/utils";

type PasswordFieldProps = Omit<ComponentProps<"input">, "id" | "className" | "type"> & {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  className?: string;
};

/**
 * Campo de senha com botão de mostrar/ocultar, no padrão visual do
 * `TextField` (ui/field.tsx). Versão simples do Kaike porque o Caike ainda
 * não desenhou uma no Figma — ele refina depois, como já aconteceu com
 * `ui/dialog.tsx`.
 */
export function PasswordField({
  label,
  htmlFor,
  hint,
  error,
  className,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field label={label} htmlFor={htmlFor} hint={hint} error={error} className={className}>
      <div className="relative">
        <input
          id={htmlFor}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          className={cn(controlClass, "pr-11")}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((atual) => !atual)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      </div>
    </Field>
  );
}
