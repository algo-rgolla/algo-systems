import { afterEach, describe, expect, it } from 'vitest'
import { averageCostFor, pointsInRange, toPortfolioView } from '@/features/portfolio/calculations'
import type { AddHoldingRequest } from '@/features/portfolio/types'
import {
  addDemoHolding,
  demoPortfolioPerformance,
  demoPortfolioState,
  resetDemoPortfolio,
} from './portfolioStore'
import { DEMO_FX_RATES, demoQuote } from './stocks'

const request = (overrides: Partial<AddHoldingRequest> = {}): AddHoldingRequest => ({
  key: 'XRO.AU',
  quantity: 50,
  price: 160,
  fees: 20,
  currency: 'AUD',
  purchaseDate: '2026-08-03',
  note: null,
  ...overrides,
})

afterEach(resetDemoPortfolio)

describe('demo portfolio store', () => {
  it('adds a holding and recalculates the summary, rows and allocation', () => {
    const before = toPortfolioView(demoPortfolioState())
    const holding = addDemoHolding(request())
    const after = toPortfolioView(demoPortfolioState())

    expect(holding.averageCost).toBeCloseTo((50 * 160 + 20) / 50, 10) // Fees spread over shares.
    expect(holding.quote).toEqual(demoQuote('XRO.AU'))
    expect(after.rows).toHaveLength(before.rows.length + 1)
    expect(after.summary.positionCount).toBe(before.summary.positionCount + 1)
    expect(after.summary.totalMarketValue).toBeCloseTo(
      before.summary.totalMarketValue + 50 * demoQuote('XRO.AU').price,
      6,
    )
    expect(after.summary.totalCost).toBeCloseTo(before.summary.totalCost + 50 * 160 + 20, 6)
    expect(after.allocation.reduce((t, s) => t + s.percent, 0)).toBeCloseTo(100, 10)
  })

  it('converts a price paid in another currency into the stock currency', () => {
    const holding = addDemoHolding(request({ key: 'AAPL.US', quantity: 10, price: 306, fees: 0 }))
    // 306 AUD at 1.53 AUD per USD is 200 USD.
    expect(holding.averageCost).toBeCloseTo(200, 10)
    expect(
      averageCostFor(request({ currency: 'USD', price: 200, fees: 0 }), 'AUD', DEMO_FX_RATES),
    ).toBeCloseTo(306, 10)
  })

  it('rejects a duplicate stock and leaves the portfolio unchanged', () => {
    const count = demoPortfolioState().holdings.length
    expect(() => addDemoHolding(request({ key: 'NVDA.US' }))).toThrow('You already hold NVDA.')
    expect(demoPortfolioState().holdings).toHaveLength(count)
  })

  it('rejects unknown stocks and invalid amounts', () => {
    expect(() => addDemoHolding(request({ key: 'ZZZ.AU' }))).toThrow(/no demo market data/i)
    expect(() => addDemoHolding(request({ quantity: 0 }))).toThrow()
  })

  it('includes a new holding in the performance series from its purchase date', () => {
    const before = demoPortfolioPerformance().points
    addDemoHolding(request({ purchaseDate: '2026-10-26' })) // After the last demo session.
    const after = demoPortfolioPerformance().points

    expect(after.at(-1)?.value).toBeCloseTo(
      (before.at(-1)?.value ?? 0) + 50 * demoQuote('XRO.AU').price,
      6,
    )
    expect(after.at(-2)?.value).toBeCloseTo(before.at(-2)?.value ?? 0, 6)
    expect(after.at(-1)?.value).toBeCloseTo(
      toPortfolioView(demoPortfolioState()).summary.totalMarketValue,
      6,
    )
  })

  it('filters performance by range', () => {
    const points = demoPortfolioPerformance().points
    const sixMonths = pointsInRange(points, '6M')
    expect(sixMonths[0].date >= '2026-04-23').toBe(true)
    expect(sixMonths.at(-1)).toEqual(points.at(-1))
    expect(pointsInRange(points, '1M').length).toBeLessThan(sixMonths.length)
  })
})
