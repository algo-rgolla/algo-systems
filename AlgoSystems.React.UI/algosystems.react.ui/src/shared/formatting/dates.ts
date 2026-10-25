/** A calendar date, e.g. "2026-10-23". Trade and quote dates have no time or zone. */
export type IsoDate = `${number}-${number}-${number}`

/** An instant with its UTC offset, e.g. "2026-10-23T16:05:00+11:00". */
export type IsoDateTime = string

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const DAY_MS = 24 * 60 * 60 * 1000

export function isIsoDate(value: string): value is IsoDate {
  return ISO_DATE.test(value)
}

/**
 * Midnight UTC on the given calendar date. Format the result with timeZone "UTC" so the
 * date never shifts a day in timezones west of Greenwich.
 */
export function isoDateToUtc(date: IsoDate): Date {
  return new Date(`${date}T00:00:00Z`)
}

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10) as IsoDate
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((isoDateToUtc(to).getTime() - isoDateToUtc(from).getTime()) / DAY_MS)
}

/** Today's calendar date in the viewer's timezone. */
export function todayIsoDate(now: Date = new Date()): IsoDate {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}` as IsoDate
}

/** The same day `months` earlier (clamped to the month's last day, e.g. 31 Mar → 28 Feb). */
export function subtractMonths(date: IsoDate, months: number): IsoDate {
  const d = isoDateToUtc(date)
  const day = d.getUTCDate()
  d.setUTCDate(1)
  d.setUTCMonth(d.getUTCMonth() - months)
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate()
  d.setUTCDate(Math.min(day, lastDay))
  return toIsoDate(d)
}
