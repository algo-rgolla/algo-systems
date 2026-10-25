import { describe, expect, it } from 'vitest'
import type { Stock } from '@/features/stocks/types'
import { summariseHistory, toClosedTrade } from './calculations'
import {
  highlightLabel,
  holdingPeriodLabel,
  netPnlView,
  profitFactorView,
  shareOf,
  summaryScope,
  winRateView,
} from './model'

const stock: Stock = {
  key: 'BHP.AU',
  symbol: 'BHP',
  market: 'AU',
  name: 'BHP Group',
  sector: 'Materials',
  currency: 'AUD',
}

/** Trades of 10 shares bought at 10, sold at each price. */
const summarise = (exitPrices: number[]) =>
  summariseHistory(
    exitPrices.map((exitPrice, i) =>
      toClosedTrade({
        id: `t${i}`,
        stock,
        side: 'long',
        quantity: 10,
        entryDate: '2026-10-01',
        exitDate: '2026-10-11',
        entryPrice: 10,
        exitPrice,
      }),
    ),
    { AUD: 1, USD: 1.5 },
    'AUD',
  )

describe('summary views', () => {
  it('says which trades the summary covers', () => {
    expect(summaryScope(40, 40)).toBe('All 40 closed trades')
    expect(summaryScope(1, 40)).toBe('1 of 40 closed trades (filtered)')
  })

  it('formats a normal mix of wins and losses', () => {
    const s = summarise([12, 13, 9]) // +20, +30, −10
    expect(netPnlView(s)).toEqual({
      value: '+$40.00',
      detail: 'Net profit · 3 trades',
      direction: 'up',
    })
    expect(winRateView(s)).toEqual({ value: '67%', detail: '2 wins · 1 loss' })
    expect(profitFactorView(s)).toEqual({
      value: '5.00',
      detail: 'Avg win +$25.00 · Avg loss −$10.00',
    })
    expect(highlightLabel(s.bestTrade, s)).toBe('BHP · +$30.00')
    expect(highlightLabel(s.worstTrade, s)).toBe('BHP · −$10.00')
  })

  it('handles no losses without dividing by zero', () => {
    const s = summarise([11, 12])
    expect(profitFactorView(s)).toEqual({
      value: 'No losses',
      detail: 'Avg win +$15.00 · Avg loss —',
    })
    expect(winRateView(s).value).toBe('100%')
  })

  it('handles break-even only, and no trades', () => {
    const even = summarise([10])
    expect(profitFactorView(even).value).toBe('—')
    expect(winRateView(even)).toEqual({ value: '0%', detail: '0 wins · 0 losses · 1 break-even' })
    expect(netPnlView(even)).toMatchObject({ value: '$0.00', direction: 'flat' })

    const none = summarise([])
    expect(profitFactorView(none)).toEqual({ value: '—', detail: 'No trades' })
    expect(winRateView(none).value).toBe('—')
    expect(highlightLabel(none.bestTrade, none)).toBe('—')
    expect(holdingPeriodLabel(none.averageHoldingDays)).toBe('—')
    expect(shareOf(0, 0)).toBe(0)
  })

  it('rounds the holding period', () => {
    expect(holdingPeriodLabel(25.6)).toBe('26 days')
    expect(holdingPeriodLabel(1.2)).toBe('1 day')
  })
})
