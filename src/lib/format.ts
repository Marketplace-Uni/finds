const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** 150 -> "R$ 150,00" */
export function formatPrice(value: number) {
  return brl.format(value);
}
