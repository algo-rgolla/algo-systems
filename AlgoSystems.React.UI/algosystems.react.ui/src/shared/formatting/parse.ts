/** Parses an API numeric string ("12.5", "1,200", "") into a number or null. */
export function parseNumber(value: string | null | undefined): number | null {
  if (value == null) return null
  const trimmed = value.trim().replace(/,/g, '')
  if (trimmed === '') return null
  const n = Number(trimmed)
  return Number.isFinite(n) ? n : null
}

const SUFFIX_MULTIPLIERS: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9, T: 1e12 }

/** Parses an abbreviated amount ("1.234B", "56.7M", "980K", "512") into a number or null. */
export function parseAbbreviatedNumber(value: string | null | undefined): number | null {
  if (value == null) return null
  const match = /^\s*(-?[\d.,]+)\s*([KMBT])?\s*$/i.exec(value)
  if (!match) return null
  const base = parseNumber(match[1])
  if (base == null) return null
  const suffix = match[2]?.toUpperCase()
  return suffix ? base * SUFFIX_MULTIPLIERS[suffix] : base
}

/** Parses a dd-MM-yyyy date string into a local Date or null. */
export function parseDayMonthYear(value: string | null | undefined): Date | null {
  if (!value) return null
  const match = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/.exec(value.trim())
  if (!match) return null
  const [, d, m, y] = match
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Parses an ISO date-time; treats .NET's DateTime.MinValue as missing. */
export function parseIsoDate(value: string | null | undefined): Date | null {
  if (!value || value.startsWith('0001-01-01')) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Normalises blank strings to null. */
export function textOrNull(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}
