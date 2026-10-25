import type { IsoDate } from '@/shared/formatting/dates'

export type MarketQuoteGroup = 'Indices' | 'Futures'

/** One instrument on the market overview board (an index or a futures contract). */
export interface MarketQuote {
  symbol: string
  name: string
  group: MarketQuoteGroup
  value: number
  open: number
  high: number
  low: number
  previousClose: number
  /** value − previousClose */
  change: number
  /** change ÷ previousClose × 100 */
  changePercent: number
}

export interface MarketOverview {
  asOf: IsoDate
  /** True for demo data. The UI must label simulated prices as such. */
  simulated: boolean
  quotes: MarketQuote[]
}
