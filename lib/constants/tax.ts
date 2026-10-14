/** Standard VAT rate applied to order totals (5%). */
export const VAT_RATE = 0.05;

export const VAT_PERCENT_LABEL = "5%";

export function calculateVatAmount(subtotal: number): number {
  return roundMoney(subtotal * VAT_RATE);
}

export function calculateTotalWithVat(subtotal: number): number {
  return roundMoney(subtotal + calculateVatAmount(subtotal));
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
