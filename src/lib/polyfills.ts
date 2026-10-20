"use client";

/**
 * Polyfills mínimos pros métodos de array do ES2023 ("mudar por cópia":
 * `toSorted`, `toReversed`, `toSpliced`) — faltam no Safari anterior à
 * 16.4 (iOS 16.0 a 16.3, achado investigando o bug de `/entrar` não
 * carregar no iOS 16.1.1). O `radix-ui` (usado por `<DropdownMenu>` no
 * menu da conta e `<Dialog>` nos modais de confirmação) chama `toSorted()`
 * internamente — sem isso, abrir esses componentes lança `TypeError`
 * nesses aparelhos, mesmo depois de corrigido o problema de sintaxe que
 * travava a página inteira (ver `package.json`, campo `browserslist`).
 *
 * Importado uma vez no layout raiz (`src/app/layout.tsx`), roda antes do
 * resto do bundle do cliente.
 */
if (typeof Array.prototype.toSorted !== "function") {
  Array.prototype.toSorted = function <T>(
    this: T[],
    compareFn?: (a: T, b: T) => number,
  ): T[] {
    return [...this].sort(compareFn);
  };
}

if (typeof Array.prototype.toReversed !== "function") {
  Array.prototype.toReversed = function <T>(this: T[]): T[] {
    return [...this].reverse();
  };
}

if (typeof Array.prototype.toSpliced !== "function") {
  Array.prototype.toSpliced = function <T>(
    this: T[],
    start: number,
    deleteCount?: number,
    ...items: T[]
  ): T[] {
    const copia = [...this];
    if (deleteCount === undefined) {
      copia.splice(start);
    } else {
      copia.splice(start, deleteCount, ...items);
    }
    return copia;
  };
}
