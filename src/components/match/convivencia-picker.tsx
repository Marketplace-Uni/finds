"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import type { ConvivenciaState } from "@/src/app/(main)/configuracoes/convivencia/actions";

export type Trait = {
  /** Chave no banco, ex.: "dorme-cedo". */
  key: string;
  label: string;
  /** rotina, organização, convivência, estilo de vida, hábitos. */
  group: string;
};

type ConvivenciaPickerProps = {
  traits: Trait[];
  /** Chaves marcadas em "eu sou". */
  self?: string[];
  /** Chaves marcadas em "procuro". */
  wanted?: string[];
  /** Sem ação real (caso do `/preview-visual`, que não tem conta por trás),
   * o botão só existe pro visual — não salva nada. */
  action?: (prevState: ConvivenciaState, formData: FormData) => Promise<ConvivenciaState>;
  className?: string;
};

const initialState: ConvivenciaState = {};

async function semAcao(prevState: ConvivenciaState): Promise<ConvivenciaState> {
  return prevState;
}

/** Chip selecionável — o mesmo padrão dos filtros: input escondido + label. */
function TraitChip({
  name,
  trait,
  checked,
}: {
  name: "sou" | "procuro";
  trait: Trait;
  checked: boolean;
}) {
  const id = `${name}-${trait.key}`;
  return (
    <div>
      <input
        id={id}
        type="checkbox"
        name={name}
        value={trait.key}
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
        {trait.label}
      </label>
    </div>
  );
}

function Coluna({
  name,
  titulo,
  descricao,
  traits,
  marcadas,
}: {
  name: "sou" | "procuro";
  titulo: string;
  descricao: string;
  traits: Trait[];
  marcadas: string[];
}) {
  // Agrupa na ordem em que os grupos aparecem na lista vinda do banco.
  const grupos = traits.reduce<Record<string, Trait[]>>((acc, trait) => {
    (acc[trait.group] ??= []).push(trait);
    return acc;
  }, {});

  return (
    <section className="flex flex-col gap-4">
      <header>
        <h2 className="text-lg font-bold text-foreground">{titulo}</h2>
        <p className="text-sm text-muted-foreground">{descricao}</p>
      </header>

      {Object.entries(grupos).map(([grupo, lista]) => (
        <fieldset key={grupo}>
          <legend className="mb-2 text-sm font-medium text-foreground">{grupo}</legend>
          <div className="flex flex-wrap gap-2">
            {lista.map((trait) => (
              <TraitChip
                key={trait.key}
                name={name}
                trait={trait}
                checked={marcadas.includes(trait.key)}
              />
            ))}
          </div>
        </fieldset>
      ))}
    </section>
  );
}

/**
 * Perfil de convivência: a pessoa marca como ela é e o que procura em quem vai
 * dividir moradia. É o que alimenta o match (ver `src/lib/match.ts`).
 *
 * Não existe tela para isso no Figma — foi composto com os chips de categoria
 * do feed, que são o padrão de seleção do Finds (ver docs/DESIGN.md).
 *
 * As tags vêm do banco por props; o componente não busca nada.
 */
export function ConvivenciaPicker({
  traits,
  self = [],
  wanted = [],
  action,
  className,
}: ConvivenciaPickerProps) {
  const [state, formAction, isPending] = useActionState(action ?? semAcao, initialState);
  const ultimoAvisado = useRef(0);

  useEffect(() => {
    if (!state.attempt || state.attempt === ultimoAvisado.current) return;
    ultimoAvisado.current = state.attempt;

    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success("Perfil de convivência atualizado!");
    }
  }, [state]);

  return (
    <form action={formAction} className={cn("flex flex-col gap-8", className)}>
      <div className="grid gap-8 lg:grid-cols-2">
        <Coluna
          name="sou"
          titulo="Eu sou"
          descricao="Marque o que combina com você no dia a dia."
          traits={traits}
          marcadas={self}
        />
        <Coluna
          name="procuro"
          titulo="Eu procuro"
          descricao="E o que você espera de quem vai dividir a moradia."
          traits={traits}
          marcadas={wanted}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} className="rounded-pill px-8">
          {isPending ? "Salvando..." : "Salvar perfil de convivência"}
        </Button>
      </div>
    </form>
  );
}
