import { describe, expect, it } from 'vitest'
import type { Stock } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import { toClosedTrade } from './calculations'
import {
  dateRangeError,
  DEFAULT_TRADE_FILTERS,
  filterClosedTrades,
  hasActiveTradeFilters,
  type ClosedTradeFilters,
} from './filters'

const stock = (symbol: string, name: string, market: 'AU' | 'US'): Stock => ({
  key: `${symbol}.${market}`,
  symbol,
  market,
  name,
  sector: 'Test',
  currency: market === 'AU' ? 'AUD' : 'USD',
})

const trade = (id: string, s: Stock, exitDate: IsoDate, exitPrice: number) =>
  toClosedTrade({
    id,
    stock: s,
    side: 'long',
    quantity: 10,
    entryDate: '2026-01-05',
    exitDate,
    entryPrice: 100,
    exitPrice,
  })

const trades = [
  trade('a', stock('NVDA', 'NVIDIA', 'US'), '2026-10-21', 110),
  trade('b', stock('BHP', 'BHP Group', 'AU'), '2026-09-15', 90),
  trade('c', stock('TLS', 'Telstra Group', 'AU'), '2026-06-16', 100),
]

const ids = (filters: Partial<ClosedTradeFilters>) =>
  filterClosedTrades(trades, { ...DEFAULT_TRADE_FILTERS, ...filters }).map((t) => t.id)

describe('filterClosedTrades', () => {
  it('keeps everything with the default filters', () => {
    expect(ids({})).toEqual(['a', 'b', 'c'])
    expect(hasActiveTradeFilters(DEFAULT_TRADE_FILTERS)).toBe(false)
  })

  it('searches the start of the symbol and anywhere in the name', () => {
    expect(ids({ search: 'nv' })).toEqual(['a'])
    expect(ids({ search: ' group ' })).toEqual(['b', 'c'])
    expect(ids({ search: 'VDA' })).toEqual([]) // Not the start of the symbol.
  })

  it('filters by market and outcome', () => {
    expect(ids({ market: 'AU' })).toEqual(['b', 'c'])
    expect(ids({ outcome: 'win' })).toEqual(['a'])
    expect(ids({ outcome: 'loss' })).toEqual(['b'])
    expect(ids({ outcome: 'breakeven' })).toEqual(['c'])
  })

  it('filters by exit date, inclusive at both ends', () => {
    expect(ids({ from: '2026-09-15' })).toEqual(['a', 'b'])
    expect(ids({ to: '2026-09-15' })).toEqual(['b', 'c'])
    expect(ids({ from: '2026-09-16', to: '2026-10-20' })).toEqual([])
  })

  it('reports a backwards date range', () => {
    const backwards: ClosedTradeFilters = {
      ...DEFAULT_TRADE_FILTERS,
      from: '2026-10-01',
      to: '2026-09-01',
    }
    expect(dateRangeError(backwards)).toMatch(/after/)
    expect(dateRangeError({ ...DEFAULT_TRADE_FILTERS, from: '2026-09-01' })).toBeNull()
    expect(hasActiveTradeFilters(backwards)).toBe(true)
  })
})
