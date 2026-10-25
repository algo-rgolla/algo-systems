import { describe, expect, it } from 'vitest'
import type { Stock } from '@/features/stocks/types'
import { summariseHistory, toClosedTrade, type ClosedTradeRecord } from './calculations'

const stock: Stock = {
  key: 'NVDA.US',
  symbol: 'NVDA',
  market: 'US',
  name: 'NVIDIA',
  sector: 'Semiconductors',
  currency: 'USD',
}

const record = (
  id: string,
  entryPrice: number,
  exitPrice: number,
  side: 'long' | 'short' = 'long',
): ClosedTradeRecord => ({
  id,
  stock,
  side,
  quantity: 10,
  entryDate: '2026-10-01',
  exitDate: '2026-10-11',
  entryPrice,
  exitPrice,
})

describe('toClosedTrade', () => {
  it('derives P/L, return, holding days and outcome', () => {
    const trade = toClosedTrade({ ...record('a', 168.4, 182.42), quantity: 25 })
    expect(trade.realisedPnl).toBe(350.5) // Rounded to cents, not 350.4999…
    expect(trade.returnPercent).toBeCloseTo(8.3254, 4)
    expect(trade.holdingDays).toBe(10)
    expect(trade.outcome).toBe('win')
  })

  it('reverses the sign for shorts and recognises break-even trades', () => {
    expect(toClosedTrade(record('s', 100, 90, 'short')).realisedPnl).toBe(100)
    expect(toClosedTrade(record('s', 100, 110, 'short')).outcome).toBe('loss')
    expect(toClosedTrade(record('b', 100, 100)).outcome).toBe('breakeven')
  })
})

describe('summariseHistory', () => {
  it('totals trades in the base currency', () => {
    const trades = [record('w', 10, 12), record('l', 10, 9), record('e', 10, 10)].map(toClosedTrade)
    const s = summariseHistory(trades, { AUD: 1, USD: 2 }, 'AUD')

    expect(s.netPnl).toBeCloseTo((20 - 10) * 2)
    expect(s.grossProfit).toBeCloseTo(40)
    expect(s.grossLoss).toBeCloseTo(-20)
    expect(s.profitFactor).toBeCloseTo(2)
    expect([s.wins, s.losses, s.breakeven]).toEqual([1, 1, 1])
    expect(s.winRate).toBeCloseTo(100 / 3)
    expect(s.bestTrade?.tradeId).toBe('w')
    expect(s.worstTrade?.tradeId).toBe('l')
  })

  it('returns nulls instead of dividing by zero', () => {
    const empty = summariseHistory([], { AUD: 1, USD: 1 }, 'AUD')
    expect([empty.winRate, empty.profitFactor, empty.bestTrade]).toEqual([null, null, null])
    const allWins = summariseHistory([toClosedTrade(record('w', 1, 2))], { AUD: 1, USD: 1 }, 'AUD')
    expect(allWins.profitFactor).toBeNull()
    expect(allWins.averageLoss).toBeNull()
  })
})
