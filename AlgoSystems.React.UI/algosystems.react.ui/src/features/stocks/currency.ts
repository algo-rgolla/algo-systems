import type { CurrencyCode } from '@/shared/formatting/format'

/** Units of the base currency per one unit of each currency. The base currency maps to 1. */
export type FxRates = Record<CurrencyCode, number>

/** Converts an amount into the base currency of `rates`. */
export function toBaseCurrency(amount: number, currency: CurrencyCode, rates: FxRates): number {
  return amount * rates[currency]
}

/** Converts an amount between any two currencies of `rates`, via the base currency. */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  rates: FxRates,
): number {
  return (amount * rates[from]) / rates[to]
}
