const LOCALE = 'en-AU'
const DASH = '—'
/** U+2212, as in the design. Screen readers announce it as "minus". */
const MINUS = '−'

/** "+", "−" or "" for a value as displayed, so −0.001 shown as "0.00" gets no sign. */
function signOf(rounded: number, signed: boolean) {
  if (rounded < 0) return MINUS
  return signed && rounded > 0 ? '+' : ''
}

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
})

export type CurrencyCode = 'AUD' | 'USD'

// In en-AU, AUD formats as "$1,234" and USD as "USD 1,234", so mixed lists stay unambiguous.
const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  AUD: new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }),
  USD: new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }),
}

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** Share price: 2–3 decimals (ASX penny stocks trade in tenths of a cent). */
export function formatPrice(value: number | null): string {
  return value == null ? DASH : priceFormatter.format(value)
}

interface CurrencyOptions {
  /** Prefix positive amounts with "+". */
  signed?: boolean
  currency?: CurrencyCode
}

/** Whole-unit currency amount (AUD unless given), with an explicit sign when `signed` is set. */
export function formatCurrency(
  value: number | null,
  { signed = false, currency = 'AUD' }: CurrencyOptions = {},
): string {
  if (value == null) return DASH
  const rounded = Math.round(value)
  return `${signOf(rounded, signed)}${currencyFormatters[currency].format(Math.abs(rounded))}`
}

/** Percentage with an explicit sign, e.g. "+3.25%" or "−0.44%". */
export function formatPercent(value: number | null): string {
  if (value == null) return DASH
  const rounded = Number(value.toFixed(2))
  return `${signOf(rounded, true)}${Math.abs(rounded).toFixed(2)}%`
}

export function formatCompact(value: number | null): string {
  return value == null ? DASH : compactFormatter.format(value)
}

export function formatInteger(value: number | null): string {
  return value == null ? DASH : integerFormatter.format(value)
}

export function formatDate(value: Date | null): string {
  return value == null ? DASH : dateFormatter.format(value)
}
