import type { FxRates } from '@/features/stocks/currency'
import type { PositionSide, QuotedStock } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'

/** An open position you entered yourself. Prices are in the stock's currency. */
export interface PortfolioHolding extends QuotedStock {
  id: string
  side: PositionSide
  quantity: number
  /** Average price paid per share. */
  averageCost: number
  openedAt: IsoDate
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

/** What the Add holding form submits. */
export interface NewHolding {
  key: QuotedStock['stock']['key']
  side: PositionSide
  quantity: number
  averageCost: number
  openedAt: IsoDate
}
