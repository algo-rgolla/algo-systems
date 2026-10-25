import type { FxRates } from '@/features/stocks/currency'
import type { PositionSide, QuotedStock } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'

/** An open position you entered yourself. Prices are in the stock's currency. */
export interface PortfolioHolding extends QuotedStock {
  id: string
  side: PositionSide
  quantity: number
  /** Average price paid per share in the stock's currency, including fees. */
  averageCost: number
  openedAt: IsoDate
  note: string | null
}

export interface Portfolio {
  id: string
  name: string
  /** Summary figures and allocation are in this currency. */
  baseCurrency: CurrencyCode
  /** Uninvested cash, in the base currency. */
  cash: number
  /** Conversion used for summary figures, as of `asOf`. */
  fxRates: FxRates
  asOf: IsoDate
  holdings: PortfolioHolding[]
}

/** A holding's figures, in its own currency unless named "Base". */
export interface HoldingValuation {
  costBasis: number
  marketValue: number
  unrealisedPnl: number
  unrealisedPnlPercent: number
  /** Today's change in value: quantity × the quote's change. */
  dayChange: number
  marketValueBase: number
  unrealisedPnlBase: number
  /** Share of total invested market value, in percent. */
  weightPercent: number
}

/** Account-level figures, all in the portfolio's base currency. */
export interface PortfolioSummary {
  baseCurrency: CurrencyCode
  positionCount: number
  totalCost: number
  totalMarketValue: number
  /** Unrealised gain on open holdings. */
  totalReturn: number
  totalReturnPercent: number
  dayChange: number
  /** Today's change as a share of yesterday's market value. */
  dayChangePercent: number
  cash: number
  /** Cash as a share of the whole account (market value + cash). */
  cashPercent: number
  accountValue: number
}

export interface SectorAllocation {
  sector: string
  marketValue: number
  /** Share of total invested market value. Slices sum to 100. */
  percent: number
}

/**
 * What the Add holding form submits. Price and fees are in `currency`; the server converts them
 * into the stock's currency for the holding's average cost.
 */
export interface AddHoldingRequest {
  key: QuotedStock['stock']['key']
  quantity: number
  price: number
  fees: number
  currency: CurrencyCode
  purchaseDate: IsoDate
  note: string | null
}

export interface PerformancePoint {
  date: IsoDate
  /** Market value of the holdings open on that date, in the base currency. */
  value: number
}

export interface PortfolioPerformance {
  baseCurrency: CurrencyCode
  /** One point per trading session, oldest first. */
  points: PerformancePoint[]
}

export const PERFORMANCE_RANGES = ['1M', '3M', '6M', '1Y'] as const

export type PerformanceRange = (typeof PERFORMANCE_RANGES)[number]
