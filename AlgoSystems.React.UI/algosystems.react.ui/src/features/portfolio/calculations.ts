import { sideSign, sum } from '@/features/stocks/calculations'
import { toBaseCurrency } from '@/features/stocks/currency'
import type {
  HoldingValuation,
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
