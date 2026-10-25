import { describe, expect, it } from 'vitest'
import type { Stock, StockQuote } from '@/features/stocks/types'
import { sectorAllocation, summarisePortfolio, valueHolding } from './calculations'
import type { Portfolio, PortfolioHolding } from './types'

const stock = (symbol: string, sector: string, currency: 'AUD' | 'USD' = 'AUD'): Stock => ({
  key: `${symbol}.${currency === 'AUD' ? 'AU' : 'US'}`,
  symbol,
  market: currency === 'AUD' ? 'AU' : 'US',
  name: symbol,
  sector,
  currency,
})

const quote = (price: number, change: number): StockQuote => ({
  key: 'X.AU',
  asOf: '2026-10-23',
  open: price,
  high: price,
  low: price,
  price,
  previousClose: price - change,
  change,
  changePercent: (change / (price - change)) * 100,
  volume: 0,
  averageVolume: 0,
})

const holding = (
  s: Stock,
  q: StockQuote,
  quantity: number,
  averageCost: number,
  side: 'long' | 'short' = 'long',
): PortfolioHolding => ({
  id: s.symbol,
  stock: s,
  quote: q,
  side,
  quantity,
  averageCost,
  openedAt: '2026-01-02',
  note: null,
})

const portfolio = (holdings: PortfolioHolding[], cash = 0): Portfolio => ({
  id: 'p',
  name: 'Test',
  baseCurrency: 'AUD',
  cash,
  fxRates: { AUD: 1, USD: 1.5 },
  asOf: '2026-10-23',
  holdings,
})

describe('summarisePortfolio', () => {
  it('converts foreign holdings into the base currency', () => {
    const p = portfolio(
      [
        holding(stock('AAA', 'Tech'), quote(10, 1), 100, 8), // AUD: value 1,000, cost 800
        holding(stock('BBB', 'Tech', 'USD'), quote(20, -2), 10, 25), // USD 200 = AUD 300, cost 375
      ],
      500,
    )
    const s = summarisePortfolio(p)

    expect(s.totalMarketValue).toBeCloseTo(1300)
    expect(s.totalCost).toBeCloseTo(1175)
    expect(s.totalReturn).toBeCloseTo(125)
    expect(s.totalReturnPercent).toBeCloseTo((125 / 1175) * 100)
    expect(s.dayChange).toBeCloseTo(100 - 30) // +1 × 100 AUD, −2 × 10 × 1.5
    expect(s.dayChangePercent).toBeCloseTo((70 / 1230) * 100)
    expect(s.accountValue).toBeCloseTo(1800)
    expect(s.cashPercent).toBeCloseTo((500 / 1800) * 100)
  })

  it('profits from falling prices on short positions', () => {
    const p = portfolio([holding(stock('SSS', 'Tech'), quote(90, -5), 10, 100, 'short')])
    const s = summarisePortfolio(p)
    expect(s.totalReturn).toBeCloseTo(100)
    expect(s.dayChange).toBeCloseTo(50)
    expect(valueHolding(p.holdings[0], p).unrealisedPnlPercent).toBeCloseTo(10)
  })

  it('returns zeros, not NaN, for an empty account', () => {
    const s = summarisePortfolio(portfolio([]))
    expect(Object.values(s).filter((v) => typeof v === 'number' && Number.isNaN(v))).toEqual([])
    expect(s.positionCount).toBe(0)
  })
})

describe('sectorAllocation', () => {
  it('groups the smallest sectors into Other and sums to 100%', () => {
    const p = portfolio(
      ['A', 'B', 'C', 'D'].map((sector, i) =>
        holding(stock(`S${i}`, sector), quote(10, 0), (4 - i) * 10, 10),
      ),
    )
    const slices = sectorAllocation(p, 3)
    expect(slices.map((s) => s.sector)).toEqual(['A', 'B', 'Other'])
    expect(slices[2].marketValue).toBeCloseTo(300) // C 200 + D 100
    expect(slices.reduce((t, s) => t + s.percent, 0)).toBeCloseTo(100)
  })
})
