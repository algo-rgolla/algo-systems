import type { Market } from '@/features/stocks/markets'
import type { IsoDate } from '@/shared/formatting/dates'
import type { ClosedTrade, TradeOutcome } from './types'

export interface ClosedTradeFilters {
  /** Matches the start of the symbol or any part of the company name. */
  search: string
  market: Market | 'all'
  outcome: TradeOutcome | 'all'
  /** Exit date range, inclusive; '' for no bound. A trade is realised on its exit date. */
  from: IsoDate | ''
  to: IsoDate | ''
}

export const DEFAULT_TRADE_FILTERS: ClosedTradeFilters = {
  search: '',
  market: 'all',
  outcome: 'all',
  from: '',
  to: '',
}

export function hasActiveTradeFilters(filters: ClosedTradeFilters): boolean {
  return (Object.keys(DEFAULT_TRADE_FILTERS) as (keyof ClosedTradeFilters)[]).some(
    (key) => filters[key] !== DEFAULT_TRADE_FILTERS[key],
  )
}

/** A message when the date range is backwards, else null. */
export function dateRangeError({ from, to }: ClosedTradeFilters): string | null {
  return from !== '' && to !== '' && from > to ? 'The start date is after the end date.' : null
}

export function filterClosedTrades(
  trades: readonly ClosedTrade[],
  filters: ClosedTradeFilters,
): ClosedTrade[] {
  const search = filters.search.trim().toLowerCase()
  return trades.filter(
    (t) =>
      (search === '' ||
        t.stock.symbol.toLowerCase().startsWith(search) ||
        t.stock.name.toLowerCase().includes(search)) &&
      (filters.market === 'all' || t.stock.market === filters.market) &&
      (filters.outcome === 'all' || t.outcome === filters.outcome) &&
      (filters.from === '' || t.exitDate >= filters.from) &&
      (filters.to === '' || t.exitDate <= filters.to),
  )
}
