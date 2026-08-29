export interface SupportPricingValues {
  exhibition_price?: number | string | null;
  installation_price?: number | string | null;
  printing_price?: number | string | null;
  monthly_price?: number | string | null;
  exclusive_price?: number | string | null;
}

function toAmount(value: unknown): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
}

/** Internal/base support total: exhibition + installation + printing. */
export function calculateSupportTotal(pricing?: SupportPricingValues | null): number {
  if (!pricing) return 0;
  return toAmount(pricing.exhibition_price) + toAmount(pricing.installation_price) + toAmount(pricing.printing_price);
}

export function formatSupportCurrency(value: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(toAmount(value));
}
