import { sideSign, sum } from '@/features/stocks/calculations'
import { convertCurrency, toBaseCurrency, type FxRates } from '@/features/stocks/currency'
import type { PriceBar, StockKey } from '@/features/stocks/types'
import { subtractMonths, type IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'
import type {
  AddHoldingRequest,
  HoldingValuation,
  PerformancePoint,
  PerformanceRange,
  Portfolio,
  PortfolioHolding,
  PortfolioSummary,
  SectorAllocation,
} from './types'

function marketValueBase(holding: PortfolioHolding, portfolio: Portfolio) {
  return toBaseCurrency(
    holding.quantity * holding.quote.price,
    holding.stock.currency,
    portfolio.fxRates,
  )
}

function totalMarketValueBase(portfolio: Portfolio) {
  return sum(portfolio.holdings.map((h) => marketValueBase(h, portfolio)))
}

export function valueHolding(holding: PortfolioHolding, portfolio: Portfolio): HoldingValuation {
  const sign = sideSign(holding.side)
  const costBasis = holding.quantity * holding.averageCost
  const marketValue = holding.quantity * holding.quote.price
  const unrealisedPnl = (marketValue - costBasis) * sign
  const valueBase = marketValueBase(holding, portfolio)
  const total = totalMarketValueBase(portfolio)

  return {
    costBasis,
    marketValue,
    unrealisedPnl,
    unrealisedPnlPercent: costBasis === 0 ? 0 : (unrealisedPnl / costBasis) * 100,
    dayChange: holding.quantity * holding.quote.change * sign,
    marketValueBase: valueBase,
    unrealisedPnlBase: toBaseCurrency(unrealisedPnl, holding.stock.currency, portfolio.fxRates),
    weightPercent: total === 0 ? 0 : (valueBase / total) * 100,
  }
}

export function summarisePortfolio(portfolio: Portfolio): PortfolioSummary {
  const { holdings, fxRates } = portfolio
  const inBase = (amount: number, holding: PortfolioHolding) =>
    toBaseCurrency(amount, holding.stock.currency, fxRates)

  const totalCost = sum(holdings.map((h) => inBase(h.quantity * h.averageCost, h)))
  const totalMarketValue = totalMarketValueBase(portfolio)
  const totalReturn = sum(
    holdings.map((h) => inBase((h.quote.price - h.averageCost) * h.quantity * sideSign(h.side), h)),
  )
  const dayChange = sum(
    holdings.map((h) => inBase(h.quote.change * h.quantity * sideSign(h.side), h)),
  )
  const previousValue = totalMarketValue - dayChange
  const accountValue = totalMarketValue + portfolio.cash

  return {
    baseCurrency: portfolio.baseCurrency,
    positionCount: holdings.length,
    totalCost,
    totalMarketValue,
    totalReturn,
    totalReturnPercent: totalCost === 0 ? 0 : (totalReturn / totalCost) * 100,
    dayChange,
    dayChangePercent: previousValue === 0 ? 0 : (dayChange / previousValue) * 100,
    cash: portfolio.cash,
    cashPercent: accountValue === 0 ? 0 : (portfolio.cash / accountValue) * 100,
    accountValue,
  }
}

/**
 * Market value by sector, largest first. Sectors beyond `maxSlices − 1` are grouped as
 * "Other", so the chart stays readable.
 */
export function sectorAllocation(portfolio: Portfolio, maxSlices = 5): SectorAllocation[] {
  const bySector = new Map<string, number>()
  for (const holding of portfolio.holdings) {
    const sector = holding.stock.sector
    bySector.set(sector, (bySector.get(sector) ?? 0) + marketValueBase(holding, portfolio))
  }

  const total = sum([...bySector.values()])
  const slices = [...bySector.entries()]
    .map(([sector, marketValue]) => ({ sector, marketValue }))
    .sort((a, b) => b.marketValue - a.marketValue)

  const grouped =
    slices.length > maxSlices
      ? [
          ...slices.slice(0, maxSlices - 1),
          {
            sector: 'Other',
            marketValue: sum(slices.slice(maxSlices - 1).map((s) => s.marketValue)),
          },
        ]
      : slices

  return grouped.map((s) => ({ ...s, percent: total === 0 ? 0 : (s.marketValue / total) * 100 }))
}

/** quantity × price + fees, in the purchase currency. */
export function purchaseCost(quantity: number, price: number, fees: number): number {
  return quantity * price + fees
}

/** Average cost per share in the stock's currency, with fees spread across the shares. */
export function averageCostFor(
  purchase: Pick<AddHoldingRequest, 'quantity' | 'price' | 'fees' | 'currency'>,
  stockCurrency: CurrencyCode,
  rates: FxRates,
): number {
  const cost = purchaseCost(purchase.quantity, purchase.price, purchase.fees)
  return convertCurrency(cost, purchase.currency, stockCurrency, rates) / purchase.quantity
}

/**
 * The portfolio's market value at each session's close, counting each holding from the day it
 * was opened. Values are in the base currency.
 */
export function portfolioValueSeries(
  holdings: PortfolioHolding[],
  barsFor: (key: StockKey) => PriceBar[],
  rates: FxRates,
): PerformancePoint[] {
  const byDate = new Map<IsoDate, number>()
  for (const holding of holdings) {
    const bars = barsFor(holding.stock.key)
    // A holding bought after the last session is already in the latest value, so count it there.
    const lastDate = bars.at(-1)?.date
    const from = lastDate && holding.openedAt > lastDate ? lastDate : holding.openedAt
    for (const bar of bars) {
      const held = bar.date >= from
      const value = held
        ? toBaseCurrency(holding.quantity * bar.close, holding.stock.currency, rates)
        : 0
      byDate.set(bar.date, (byDate.get(bar.date) ?? 0) + value)
    }
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ date, value }))
}

const RANGE_MONTHS: Record<PerformanceRange, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12 }

/** The points within `range` of the last point, oldest first. */
export function pointsInRange(
  points: PerformancePoint[],
  range: PerformanceRange,
): PerformancePoint[] {
  const last = points.at(-1)
  if (!last) return []
  const start = subtractMonths(last.date, RANGE_MONTHS[range])
  return points.filter((p) => p.date >= start)
}

export interface HoldingRow extends PortfolioHolding, HoldingValuation {
  /** Stable grid row id. */
  rowKey: string
}

/** Everything the Portfolio page shows, derived from the portfolio record. */
export interface PortfolioView {
  portfolio: Portfolio
  summary: PortfolioSummary
  rows: HoldingRow[]
  allocation: SectorAllocation[]
}

export function toPortfolioView(portfolio: Portfolio): PortfolioView {
  return {
    portfolio,
    summary: summarisePortfolio(portfolio),
    rows: portfolio.holdings.map((holding) => ({
      ...holding,
      ...valueHolding(holding, portfolio),
      rowKey: holding.id,
    })),
    // Three largest sectors and "Other", as in the design.
    allocation: sectorAllocation(portfolio, 4),
  }
}
