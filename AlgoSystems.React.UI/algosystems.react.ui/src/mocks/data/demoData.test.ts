/**
 * Checks that the demo data is internally consistent: every derived figure is recomputed here
 * independently from the raw records, and the design reference's figures are preserved.
 */
import { describe, expect, it, vi } from 'vitest'
import { summariseHistory } from '@/features/portfolio-history/calculations'
import {
  sectorAllocation,
  summarisePortfolio,
  valueHolding,
} from '@/features/portfolio/calculations'
import { SCAN_TYPES } from '@/features/stock-scans/types'
import { ema } from '@/features/stocks/indicators'
import { isIsoDate, isoDateToUtc, type IsoDate } from '@/shared/formatting/dates'
import { formatCurrency, formatPercent, formatPrice } from '@/shared/formatting/format'
import { demoEmptyPortfolio, demoPortfolio } from './portfolio'
import { demoClosedTrades } from './portfolioHistory'
import { demoScanResults, demoScanRuns, SCAN_RULES } from './scans'
import {
  DEMO_AS_OF,
  DEMO_FX_RATES,
  demoPriceHistory,
  demoQuote,
  demoQuotedStock,
  demoStocks,
  PRICE_HISTORY_SESSIONS,
} from './stocks'
import { demoEmptyWatchlist, demoWatchlist } from './watchlist'

const isWeekday = (date: IsoDate) => ![0, 6].includes(isoDateToUtc(date).getUTCDay())
const cents = (value: number) => Math.round(value * 100) / 100
const sum = (values: number[]) => values.reduce((t, v) => t + v, 0)
const fx = (currency: 'AUD' | 'USD') => DEMO_FX_RATES[currency]

describe('stocks and quotes', () => {
  it('has unique keys and a quote and history for every stock', () => {
    expect(new Set(demoStocks.map((s) => s.key)).size).toBe(demoStocks.length)
    expect(demoStocks.filter((s) => s.market === 'AU').length).toBeGreaterThanOrEqual(30)
    expect(demoStocks.filter((s) => s.market === 'US').length).toBeGreaterThanOrEqual(20)
  })

  it('derives each quote from the last two sessions of its price history', () => {
    for (const stock of demoStocks) {
      const quote = demoQuote(stock.key)
      const bars = demoPriceHistory(stock.key).bars
      const [previous, last] = bars.slice(-2)

      expect(quote.asOf).toBe(DEMO_AS_OF)
      expect([quote.open, quote.high, quote.low, quote.price, quote.volume]).toEqual([
        last.open,
        last.high,
        last.low,
        last.close,
        last.volume,
      ])
      expect(quote.previousClose).toBe(previous.close)
      expect(quote.change).toBeCloseTo(cents(quote.price - quote.previousClose), 10)
      expect(quote.changePercent).toBeCloseTo((quote.change / quote.previousClose) * 100, 10)
      expect(quote.averageVolume).toBe(
        Math.round(sum(bars.slice(-21, -1).map((b) => b.volume)) / 20),
      )
    }
  })

  it('has well-formed daily bars on weekdays, ending at the as-of date', () => {
    for (const stock of demoStocks) {
      const bars = demoPriceHistory(stock.key).bars
      expect(bars).toHaveLength(PRICE_HISTORY_SESSIONS)
      expect(bars[bars.length - 1].date).toBe(DEMO_AS_OF)
      bars.forEach((bar, i) => {
        expect(isIsoDate(bar.date) && isWeekday(bar.date)).toBe(true)
        if (i > 0) expect(bar.date > bars[i - 1].date).toBe(true)
        expect(bar.high).toBeGreaterThanOrEqual(Math.max(bar.open, bar.close))
        expect(bar.low).toBeLessThanOrEqual(Math.min(bar.open, bar.close))
        expect(bar.low).toBeGreaterThan(0)
      })
    }
  })

  it('keeps the design reference prices and day changes', () => {
    const reference: [string, string, string][] = [
      ['NVDA.US', '182.42', '+2.84%'],
      ['MSFT.US', '524.18', '+0.92%'],
      ['GOOGL.US', '248.70', '+1.35%'],
      ['AVGO.US', '371.22', '−0.44%'],
      ['TSM.US', '298.50', '+1.72%'],
      ['AMAT.US', '226.10', '+0.76%'],
      ['PANW.US', '205.82', '−0.31%'],
      ['ASML.US', '1,042.20', '+0.88%'],
      ['PLTR.US', '151.20', '+3.18%'],
      ['AMD.US', '176.84', '+2.31%'],
      ['COST.US', '912.40', '+1.12%'],
      ['CRWD.US', '468.15', '+2.05%'],
    ]
    for (const [key, price, change] of reference) {
      const quote = demoQuote(key as `${string}.US`)
      expect([formatPrice(quote.price), formatPercent(quote.changePercent)]).toEqual([
        price,
        change,
      ])
    }
  })

  it('includes rising, falling and unchanged stocks', () => {
    const changes = demoStocks.map((s) => demoQuote(s.key).change)
    expect(changes.some((c) => c > 0)).toBe(true)
    expect(changes.some((c) => c < 0)).toBe(true)
    expect(changes.filter((c) => c === 0).length).toBeGreaterThanOrEqual(2)
  })

  it('generates identical data on every load', async () => {
    vi.resetModules()
    const reloaded = await import('./stocks')
    for (const stock of demoStocks) {
      expect(reloaded.demoPriceHistory(stock.key)).toEqual(demoPriceHistory(stock.key))
    }
  })
})

describe('scans', () => {
  const relativeVolume = (key: (typeof demoStocks)[number]['key']) => {
    const q = demoQuote(key)
    return q.volume / q.averageVolume
  }

  // Independent statements of each rule, used to check membership is complete and correct.
  const qualifies = {
    'unusual-volume': (key: (typeof demoStocks)[number]['key']) =>
      relativeVolume(key) >= SCAN_RULES.unusualVolume.minRelativeVolume &&
      demoQuote(key).changePercent > 0,
    'big-gainers': (key: (typeof demoStocks)[number]['key']) =>
      demoQuote(key).changePercent >= SCAN_RULES.bigGainers.minChangePercent,
    'ema-crossover': (key: (typeof demoStocks)[number]['key']) => {
      const closes = demoPriceHistory(key).bars.map((b) => b.close)
      const [e9, e21, e63] = [9, 21, 63].map((p) => ema(closes, p).at(-1) ?? NaN)
      return closes[closes.length - 1] > e9 && e9 > e21 && e21 > e63
    },
  }

  it('runs every scan on both markets after the demo session', () => {
    expect(demoScanRuns).toHaveLength(SCAN_TYPES.length * 2)
    for (const run of demoScanRuns) {
      expect(run.runAt.startsWith(DEMO_AS_OF)).toBe(true)
      expect(run.resultCount).toBe(demoScanResults(run.scanType, run.market).length)
      expect(run.resultCount).toBeGreaterThan(0)
    }
  })

  it('returns exactly the stocks that meet each rule, ranked by score', () => {
    for (const { scanType, market } of demoScanRuns) {
      const results = demoScanResults(scanType, market)
      const expected = demoStocks
        .filter((s) => s.market === market && qualifies[scanType](s.key))
        .map((s) => s.key)
        .sort()

      expect(results.map((r) => r.stock.key).sort()).toEqual(expected)
      expect(results.map((r) => r.rank)).toEqual(results.map((_, i) => i + 1))
      results.slice(1).forEach((r, i) => expect(r.score).toBeLessThanOrEqual(results[i].score))
      results.forEach((r) => {
        expect(r.score).toBeGreaterThanOrEqual(0)
        expect(r.score).toBeLessThanOrEqual(10)
        expect(r.quote).toEqual(demoQuote(r.stock.key))
      })
    }
  })

  it('reports metrics that match the quotes and price history', () => {
    for (const { scanType, market } of demoScanRuns) {
      for (const r of demoScanResults(scanType, market)) {
        const { metrics, quote } = r
        expect(metrics.scanType).toBe(scanType)
        if (metrics.scanType === 'unusual-volume' || metrics.scanType === 'big-gainers') {
          expect(metrics.relativeVolume).toBeCloseTo(quote.volume / quote.averageVolume, 10)
        }
        if (metrics.scanType === 'big-gainers') {
          expect(metrics.gapPercent).toBeCloseTo(
            ((quote.open - quote.previousClose) / quote.previousClose) * 100,
            10,
          )
        }
        if (metrics.scanType === 'ema-crossover') {
          const closes = demoPriceHistory(r.stock.key).bars.map((b) => b.close)
          expect(metrics.ema9).toBeCloseTo(ema(closes, 9).at(-1) ?? NaN, 10)
          expect(metrics.ema21).toBeCloseTo(ema(closes, 21).at(-1) ?? NaN, 10)
          expect(metrics.ema63).toBeCloseTo(ema(closes, 63).at(-1) ?? NaN, 10)
          expect(r.signal.strength).toBe(
            metrics.sessionsSinceCross != null &&
              metrics.sessionsSinceCross < SCAN_RULES.emaCrossover.fresh
              ? 'strong'
              : 'moderate',
          )
        }
      }
    }
  })
})

describe('watchlist', () => {
  it('shows each stock with the same quote as everywhere else', () => {
    expect(demoWatchlist.items.map((i) => i.stock.symbol)).toEqual([
      'NVDA',
      'MSFT',
      'GOOGL',
      'AVGO',
      'TSM',
      'ASML',
      'BHP',
      'CSL',
      'WTC',
    ])
    for (const item of demoWatchlist.items) {
      expect(item).toMatchObject(demoQuotedStock(item.stock.key))
      expect(item.addedAt <= DEMO_AS_OF).toBe(true)
    }
    expect(new Set(demoWatchlist.items.map((i) => i.id)).size).toBe(demoWatchlist.items.length)
    expect(demoEmptyWatchlist.items).toEqual([])
  })
})

describe('portfolio', () => {
  const summary = summarisePortfolio(demoPortfolio)

  it('agrees with totals recomputed from the holdings', () => {
    const { holdings } = demoPortfolio
    const marketValue = sum(holdings.map((h) => h.quantity * h.quote.price * fx(h.stock.currency)))
    const cost = sum(holdings.map((h) => h.quantity * h.averageCost * fx(h.stock.currency)))
    const dayChange = sum(holdings.map((h) => h.quantity * h.quote.change * fx(h.stock.currency)))

    expect(summary.positionCount).toBe(12)
    expect(summary.totalMarketValue).toBeCloseTo(marketValue, 6)
    expect(summary.totalCost).toBeCloseTo(cost, 6)
    expect(summary.totalReturn).toBeCloseTo(marketValue - cost, 6)
    expect(summary.totalReturnPercent).toBeCloseTo(((marketValue - cost) / cost) * 100, 6)
    expect(summary.dayChange).toBeCloseTo(dayChange, 6)
    expect(summary.dayChangePercent).toBeCloseTo((dayChange / (marketValue - dayChange)) * 100, 6)
    expect(summary.cashPercent).toBeCloseTo((42_500 / (marketValue + 42_500)) * 100, 6)
  })

  it('stays close to the design reference figures', () => {
    expect(formatCurrency(summary.totalMarketValue)).toBe('$248,636') // Reference: $248,650
    expect(formatCurrency(summary.totalReturn, { signed: true })).toBe('+$28,425') // +$28,420
    expect(formatPercent(summary.totalReturnPercent)).toBe('+12.91%') // +12.90%
    expect(formatCurrency(summary.cash)).toBe('$42,500')
  })

  it('has holding weights and sector slices that add up', () => {
    const weights = demoPortfolio.holdings.map((h) => valueHolding(h, demoPortfolio).weightPercent)
    expect(sum(weights)).toBeCloseTo(100, 10)

    const slices = sectorAllocation(demoPortfolio)
    expect(sum(slices.map((s) => s.percent))).toBeCloseTo(100, 10)
    expect(sum(slices.map((s) => s.marketValue))).toBeCloseTo(summary.totalMarketValue, 6)
    expect(slices[0]).toMatchObject({ sector: 'Semiconductors' })
    // The reference shows Semiconductors at 38%.
    expect(slices[0].percent).toBeGreaterThan(38)
    expect(slices[0].percent).toBeLessThan(39)
  })

  it('includes gains, losses and an unchanged holding', () => {
    const pnl = demoPortfolio.holdings.map((h) => valueHolding(h, demoPortfolio).unrealisedPnl)
    expect(pnl.some((v) => v > 0) && pnl.some((v) => v < 0) && pnl.includes(0)).toBe(true)
    expect(summarisePortfolio(demoEmptyPortfolio).totalMarketValue).toBe(0)
  })
})

describe('portfolio history', () => {
  it('reproduces the design reference trades', () => {
    const reference: [string, string, string, number][] = [
      ['t01', '+$350.50', '+8.33%', 19],
      ['t02', '+$293.00', '+5.96%', 28],
      ['t03', '−$213.36', '−4.57%', 15],
      ['t04', '+$360.00', '+8.74%', 35],
      ['t05', '−$110.00', '−2.16%', 15],
      ['t06', '+$168.80', '+10.29%', 34],
      ['t07', '−$147.24', '−3.82%', 14], // Exit moved from Saturday 26 Sep to Friday 25 Sep.
      ['t08', '+$216.80', '+5.49%', 44], // Exit moved from Saturday 19 Sep to Friday 18 Sep.
    ]
    for (const [id, pnl, ret, days] of reference) {
      const t = demoClosedTrades.find((trade) => trade.id === id)
      expect(t, id).toBeDefined()
      expect([
        formatCurrency(t?.realisedPnl ?? null, { signed: true, decimals: 2 }),
        formatPercent(t?.returnPercent ?? null),
        t?.holdingDays,
      ]).toEqual([pnl, ret, days])
    }
  })

  it('derives every trade from its prices and dates', () => {
    for (const t of demoClosedTrades) {
      const direction = t.side === 'long' ? 1 : -1
      const pnl = cents((t.exitPrice - t.entryPrice) * t.quantity * direction)
      expect(t.realisedPnl).toBeCloseTo(pnl, 10)
      expect(t.returnPercent).toBeCloseTo((pnl / (t.entryPrice * t.quantity)) * 100, 10)
      expect(t.outcome).toBe(pnl > 0 ? 'win' : pnl < 0 ? 'loss' : 'breakeven')
      expect(isWeekday(t.entryDate) && isWeekday(t.exitDate)).toBe(true)
      expect(t.entryDate < t.exitDate && t.exitDate <= DEMO_AS_OF).toBe(true)
    }
  })

  it('has enough varied trades to page, sort and filter', () => {
    expect(demoClosedTrades.length).toBeGreaterThan(25) // More than one 25-row page.
    expect(new Set(demoClosedTrades.map((t) => t.id)).size).toBe(demoClosedTrades.length)
    expect(new Set(demoClosedTrades.map((t) => t.stock.market))).toEqual(new Set(['AU', 'US']))
    expect(demoClosedTrades.some((t) => t.side === 'short')).toBe(true)
    expect(new Set(demoClosedTrades.map((t) => t.outcome))).toEqual(
      new Set(['win', 'loss', 'breakeven']),
    )
    const exits = demoClosedTrades.map((t) => t.exitDate)
    expect(exits).toEqual([...exits].sort().reverse())
  })

  it('summarises in AUD consistently with the trades', () => {
    const s = summariseHistory(demoClosedTrades, DEMO_FX_RATES, 'AUD')
    const pnl = demoClosedTrades.map((t) => t.realisedPnl * fx(t.stock.currency))
    const wins = pnl.filter((v) => v > 0)
    const losses = pnl.filter((v) => v < 0)

    expect(s.tradeCount).toBe(demoClosedTrades.length)
    expect(s.wins + s.losses + s.breakeven).toBe(s.tradeCount)
    expect(s.netPnl).toBeCloseTo(sum(pnl), 6)
    expect(s.grossProfit).toBeCloseTo(sum(wins), 6)
    expect(s.grossLoss).toBeCloseTo(sum(losses), 6)
    expect(s.profitFactor).toBeCloseTo(sum(wins) / Math.abs(sum(losses)), 10)
    expect(s.winRate).toBeCloseTo((wins.length / pnl.length) * 100, 10)
    expect(s.averageHoldingDays).toBeCloseTo(
      sum(demoClosedTrades.map((t) => t.holdingDays)) / demoClosedTrades.length,
      10,
    )
    expect(s.bestTrade?.realisedPnl).toBeCloseTo(Math.max(...pnl), 10)
    expect(s.worstTrade?.realisedPnl).toBeCloseTo(Math.min(...pnl), 10)
  })
})
