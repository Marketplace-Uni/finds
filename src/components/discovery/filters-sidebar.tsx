import Link from "next/link";

import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";

export type FilterOption = { value: string; label: string };

/** Ordenações do Figma (tela "Ordenar por"). */
export const SORT_OPTIONS: FilterOption[] = [
  { value: "recentes", label: "Mais recente" },
  { value: "relevantes", label: "Mais relevante" },
  { value: "menor-preco", label: "Menor preço" },
  { value: "maior-preco", label: "Maior preço" },
];

/** Condição do produto, do painel "Filtros". */
export const CONDITION_OPTIONS: FilterOption[] = [
  { value: "novo", label: "Novo" },
  { value: "usado", label: "Usado" },
];

export const TYPE_OPTIONS: FilterOption[] = [
  { value: "produto", label: "Produto" },
  { value: "servico", label: "Serviço" },
  { value: "roommate", label: "Roommate" },
  { value: "republica", label: "República" },
];

export type FiltersSidebarProps = {
  /** Rota que recebe o GET. */
  action?: string;
  /** Termo de busca atual, preservado num campo escondido. */
  q?: string;
  /** Vêm do banco (dados de referência): o dono da rota passa. */
  campuses?: FilterOption[];
  categories?: FilterOption[];
  /** Valores marcados hoje, lidos dos searchParams pelo dono da rota. */
  selected?: {
    tipo?: string[];
    categoria?: string[];
    campus?: string;
    condicao?: string[];
    precoMin?: number | null;
    precoMax?: number | null;
    ordem?: string;
  };
  className?: string;
};

function Legend({ children }: { children: string }) {
  return (
    <legend className="mb-2 text-sm font-semibold text-foreground">{children}</legend>
  );
}

/**
 * Chip selecionável, no lugar de checkbox/radio nativo: é o vocabulário
 * visual do Finds (os chips de categoria do feed e os de característica do
 * detalhe). O input fica escondido e o label reage com `peer-checked`, então
 * continua sendo um formulário comum, sem JavaScript.
 */
function ChipOption({
  name,
  option,
  checked,
  type = "checkbox",
}: {
  name: string;
  option: FilterOption;
  checked?: boolean;
  type?: "checkbox" | "radio";
}) {
  const id = `${name}-${option.value || "todos"}`;
  return (
    <div>
      <input
        id={id}
        type={type}
        name={name}
        value={option.value}
        defaultChecked={checked}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={cn(
          "inline-flex cursor-pointer items-center rounded-pill px-3 py-1.5 text-sm font-semibold",
          "bg-muted text-foreground transition-colors hover:bg-accent/40",
          "peer-checked:bg-primary peer-checked:text-primary-foreground",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
        )}
      >
        {option.label}
      </label>
    </div>
  );
}

/**
 * Sidebar de filtros do desktop. No Figma, "filtros", "campus" e "ordenar"
 * são três telas sobrepostas ao resultado; no desktop elas deixam de existir
 * e viram esta coluna fixa (ver docs/DESIGN.md).
 *
 * É um formulário GET: o estado dos filtros fica na URL, sem JavaScript.
 * O dono da rota lê os searchParams e filtra a query.
 */
export function FiltersSidebar({
  action = "/busca",
  q,
  campuses = [],
  categories = [],
  selected = {},
  className,
}: FiltersSidebarProps) {
  return (
    <aside className={cn("w-full lg:w-64 lg:shrink-0", className)}>
      <form action={action} className="flex flex-col gap-6 lg:sticky lg:top-6">
        {q ? <input type="hidden" name="q" value={q} /> : null}

        <h2 className="text-lg font-bold text-foreground">Filtros</h2>

        <fieldset>
          <Legend>Tipo</Legend>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((option) => (
              <ChipOption
                key={option.value}
                name="tipo"
                option={option}
                checked={selected.tipo?.includes(option.value)}
              />
            ))}
          </div>
        </fieldset>

        {categories.length > 0 ? (
          <fieldset>
            <Legend>Categoria</Legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((option) => (
                <ChipOption
                  key={option.value}
                  name="categoria"
                  option={option}
                  checked={selected.categoria?.includes(option.value)}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        {campuses.length > 0 ? (
          <fieldset>
            <Legend>Campus</Legend>
            <div className="flex flex-wrap gap-2">
              <ChipOption
                name="campus"
                type="radio"
                option={{ value: "", label: "Todos" }}
                checked={!selected.campus}
              />
              {campuses.map((option) => (
                <ChipOption
                  key={option.value}
                  name="campus"
                  type="radio"
                  option={option}
                  checked={selected.campus === option.value}
                />
              ))}
            </div>
          </fieldset>
        ) : null}

        <fieldset>
          <Legend>Condição</Legend>
          <div className="flex flex-wrap gap-2">
            {CONDITION_OPTIONS.map((option) => (
              <ChipOption
                key={option.value}
                name="condicao"
                option={option}
                checked={selected.condicao?.includes(option.value)}
              />
            ))}
          </div>
        </fieldset>

        <fieldset>
          <Legend>Faixa de preço</Legend>
          {/* O Figma usa um slider de faixa; no desktop dois campos são mais
              precisos e funcionam sem JavaScript. */}
          <div className="flex items-center gap-2">
            <label htmlFor="preco-min" className="sr-only">
              Preço mínimo
            </label>
            <input
              id="preco-min"
              type="number"
              name="preco_min"
              min={0}
              step={10}
              placeholder="R$ 0"
              defaultValue={selected.precoMin ?? undefined}
              className="h-9 w-full rounded-md bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
            <span className="text-sm text-muted-foreground">até</span>
            <label htmlFor="preco-max" className="sr-only">
              Preço máximo
            </label>
            <input
              id="preco-max"
              type="number"
              name="preco_max"
              min={0}
              step={10}
              placeholder="R$ 900"
              defaultValue={selected.precoMax ?? undefined}
              className="h-9 w-full rounded-md bg-input px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </div>
        </fieldset>

        <fieldset>
          <Legend>Ordenar por</Legend>
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <ChipOption
                key={option.value}
                name="ordem"
                type="radio"
                option={option}
                checked={(selected.ordem ?? "recentes") === option.value}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-2">
          <Button type="submit" className="rounded-pill">
            Aplicar
          </Button>
          <Button asChild variant="ghost" className="rounded-pill">
            <Link href={action}>Remover os filtros</Link>
          </Button>
        </div>
      </form>
    </aside>
  );
}
