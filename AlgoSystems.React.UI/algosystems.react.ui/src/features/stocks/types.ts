import type { IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'
import type { Market } from './markets'

/** Unique across markets, in EODHD's form: "BHP.AU", "NVDA.US". */
export type StockKey = `${string}.${Market}`

export function stockKey(symbol: string, market: Market): StockKey {
  return `${symbol}.${market}`
}

/** A listed security. Prices for it are in `currency`. */
export interface Stock {
  key: StockKey
  symbol: string
  market: Market
  name: string
  sector: string
  currency: CurrencyCode
}

/**
 * End-of-day prices for one session. The app runs on nightly data, so a quote is never live:
 * `asOf` is the session it closed.
 */
export interface StockQuote {
  key: StockKey
  asOf: IsoDate
  open: number
  high: number
  low: number
  /** Closing price of the `asOf` session. */
  price: number
  previousClose: number
  /** price − previousClose */
  change: number
  /** change ÷ previousClose × 100 */
  changePercent: number
  volume: number
  /** 20-session average volume. */
  averageVolume: number
}

export type PositionSide = 'long' | 'short'

/** A stock with its latest quote, the shape most lists display. */
export interface QuotedStock {
  stock: Stock
  quote: StockQuote
}

/** One daily candle. */
export interface PriceBar {
  date: IsoDate
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PriceHistory {
  key: StockKey
  /** Oldest first; the last bar matches the stock's current quote. */
  bars: PriceBar[]
}
