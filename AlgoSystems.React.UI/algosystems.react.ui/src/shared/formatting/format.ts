const LOCALE = 'en-AU'
const DASH = '—'

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
})

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: 'AUD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

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

/** Whole-dollar AUD amount, with an explicit sign when `signed` is set. */
export function formatCurrency(value: number | null, { signed = false } = {}): string {
  if (value == null) return DASH
  const formatted = currencyFormatter.format(Math.abs(value))
  if (value < 0) return `-${formatted}`
  return signed && value > 0 ? `+${formatted}` : formatted
}

/** Percentage with an explicit sign, e.g. "+3.25%". */
export function formatPercent(value: number | null): string {
  if (value == null) return DASH
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
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
