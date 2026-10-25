import type { ListQuery } from '@/api/types/query'
import type { Market } from '@/features/stocks/markets'
import type { PositionSide, Stock } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'

export type TradeOutcome = 'win' | 'loss' | 'breakeven'

/** A position that has been closed. Prices and P/L are in the stock's currency. */
export interface ClosedTrade {
  id: string
  stock: Stock
  side: PositionSide
  quantity: number
  entryDate: IsoDate
  exitDate: IsoDate
  entryPrice: number
  exitPrice: number
  /** (exit − entry) × quantity, negated for shorts. */
  realisedPnl: number
  /** realisedPnl ÷ (entry × quantity) × 100 */
  returnPercent: number
  /** Calendar days from entry to exit. */
  holdingDays: number
  outcome: TradeOutcome
}

export interface TradeHighlight {
  tradeId: string
  symbol: string
  /** In the base currency. */
  realisedPnl: number
}

/** Totals over closed trades, converted to the base currency. */
export interface PortfolioHistorySummary {
  baseCurrency: CurrencyCode
  tradeCount: number
  wins: number
  losses: number
  breakeven: number
  /** Wins as a percentage of all closed trades. */
  winRate: number | null
  netPnl: number
  grossProfit: number
  /** Negative (or zero). */
  grossLoss: number
  /** grossProfit ÷ |grossLoss|; null when there are no losses. */
  profitFactor: number | null
  averageWin: number | null
  /** Negative (or null). */
  averageLoss: number | null
  averageHoldingDays: number | null
  bestTrade: TradeHighlight | null
  worstTrade: TradeHighlight | null
}

export type ClosedTradeSortField =
  'exitDate' | 'entryDate' | 'symbol' | 'realisedPnl' | 'returnPercent' | 'holdingDays'

export type ClosedTradeQuery = ListQuery<
  ClosedTradeSortField,
  { market: Market; outcome: TradeOutcome; side: PositionSide; from: IsoDate; to: IsoDate }
>
