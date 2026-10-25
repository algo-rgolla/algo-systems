import { isIsoDate, isoDateToUtc, type IsoDate, type IsoDateTime } from './dates'

const LOCALE = 'en-AU'
const DASH = '—'
/** U+2212, as in the design. Screen readers announce it as "minus". */
const MINUS = '−'

/** "+", "−" or "" for a value as displayed, so −0.001 shown as "0.00" gets no sign. */
function signOf(rounded: number, signed: boolean) {
  if (rounded < 0) return MINUS
  return signed && rounded > 0 ? '+' : ''
}

function round(value: number, decimals: number) {
  return Number(value.toFixed(decimals))
}

export type CurrencyCode = 'AUD' | 'USD'

const currencyFormatters = new Map<string, Intl.NumberFormat>()

// In en-AU, AUD formats as "$1,234" and USD as "USD 1,234", so mixed lists stay unambiguous.
function currencyFormatter(currency: CurrencyCode, decimals: number) {
  const key = `${currency}:${decimals}`
  let formatter = currencyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    currencyFormatters.set(key, formatter)
  }
  return formatter
}

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 3,
})

const quantityFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 4 })

const compactFormatter = new Intl.NumberFormat(LOCALE, {
  notation: 'compact',
  maximumFractionDigits: 2,
})

const integerFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })

const dateFormat: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }
const localDateFormatter = new Intl.DateTimeFormat(LOCALE, dateFormat)
const utcDateFormatter = new Intl.DateTimeFormat(LOCALE, { ...dateFormat, timeZone: 'UTC' })

/**
 * Share price: 2–3 decimals (ASX stocks under $2 trade in tenths of a cent). With a currency,
 * includes its symbol: "$45.12" (AUD) or "USD 182.42".
 */
export function formatPrice(value: number | null, currency?: CurrencyCode): string {
  if (value == null) return DASH
  if (!currency) return priceFormatter.format(value)
  const decimals = Math.abs(value) < 2 && round(value, 2) !== round(value, 3) ? 3 : 2
  return `${signOf(value, false)}${currencyFormatter(currency, decimals).format(Math.abs(value))}`
}

interface CurrencyOptions {
  /** Prefix positive amounts with "+". */
  signed?: boolean
  currency?: CurrencyCode
  /** 0 for summary figures (the default), 2 for individual trades. */
  decimals?: number
}

/** A money amount (AUD unless given), with an explicit sign when `signed` is set. */
export function formatCurrency(
  value: number | null,
  { signed = false, currency = 'AUD', decimals = 0 }: CurrencyOptions = {},
): string {
  if (value == null) return DASH
  const rounded = round(value, decimals)
  return `${signOf(rounded, signed)}${currencyFormatter(currency, decimals).format(Math.abs(rounded))}`
}

interface PercentOptions {
  /** Prefix positive values with "+". On by default, as for price changes. */
  signed?: boolean
  decimals?: number
}

/** Percentage, e.g. "+3.25%", "−0.44%", or "38%" with `{ signed: false, decimals: 0 }`. */
export function formatPercent(
  value: number | null,
  { signed = true, decimals = 2 }: PercentOptions = {},
): string {
  if (value == null) return DASH
  const rounded = round(value, decimals)
  return `${signOf(rounded, signed)}${Math.abs(rounded).toFixed(decimals)}%`
}

/** A signed change in points or price, e.g. "+12.35" or "−8.10". */
export function formatChange(value: number | null, decimals = 2): string {
  if (value == null) return DASH
  const rounded = round(value, decimals)
  const formatted = Math.abs(rounded).toLocaleString(LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${signOf(rounded, true)}${formatted}`
}

/** Share count; fractional quantities keep up to 4 decimals. */
export function formatQuantity(value: number | null): string {
  return value == null ? DASH : quantityFormatter.format(value)
}

/** A ratio such as relative volume: "3.4×". */
export function formatMultiple(value: number | null): string {
  return value == null ? DASH : `${value.toFixed(1)}×`
}

export function formatCompact(value: number | null): string {
  return value == null ? DASH : compactFormatter.format(value)
}

export function formatInteger(value: number | null): string {
  return value == null ? DASH : integerFormatter.format(value)
}

/** "23 Oct 2026". ISO calendar dates are formatted as written, whatever the viewer's timezone. */
export function formatDate(value: Date | IsoDate | null): string {
  if (value == null) return DASH
  if (typeof value === 'string') {
    return isIsoDate(value) ? utcDateFormatter.format(isoDateToUtc(value)) : DASH
  }
  return localDateFormatter.format(value)
}

/** Clock time in the given zone (e.g. the exchange's): "4:05 pm". */
export function formatTime(value: IsoDateTime | null, timeZone: string): string {
  if (value == null) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  return new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', timeZone })
    .format(date)
    .replace(/\s*([ap])\.?\s?m\.?$/i, (_, half: string) => ` ${half.toLowerCase()}m`)
}

/** "23 Oct 2026, 4:05 pm" in the given zone. */
export function formatDateTime(value: IsoDateTime | null, timeZone: string): string {
  if (value == null) return DASH
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return DASH
  const day = new Intl.DateTimeFormat(LOCALE, { ...dateFormat, timeZone }).format(date)
  return `${day}, ${formatTime(value, timeZone)}`
}
