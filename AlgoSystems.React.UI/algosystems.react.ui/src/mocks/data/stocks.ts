import { priceChange, sum } from '@/features/stocks/calculations'
import type { FxRates } from '@/features/stocks/currency'
import { MARKETS, type Market } from '@/features/stocks/markets'
import {
  stockKey,
  type PriceBar,
  type PriceHistory,
  type QuotedStock,
  type Stock,
  type StockKey,
  type StockQuote,
} from '@/features/stocks/types'
import { toIsoDate, type IsoDate } from '@/shared/formatting/dates'
import { seededRandom, seedFrom } from './random'

/**
 * The demo stock universe: real tickers and company names with SIMULATED prices. Nothing here is
 * market data. Every quote is the close of the fictional session below.
 */
export const DEMO_AS_OF: IsoDate = '2026-10-23'

/** Fixed demo conversion into the portfolio's base currency (AUD). */
export const DEMO_FX_RATES: FxRates = { AUD: 1, USD: 1.53 }

export const PRICE_HISTORY_SESSIONS = 90

/**
 * Price path, which decides how the EMAs line up on the last session:
 * - up: a long uptrend, a pullback, then a recovery that has just re-crossed (EMA crossover setups)
 * - down: a recent slide
 * - range: no drift
 */
type Trend = 'up' | 'down' | 'range'

interface Listing {
  symbol: string
  market: Market
  name: string
  sector: string
  /** Last close. */
  price: number
  /** Change on the last session, in percent. */
  changePercent: number
  /** Typical daily share volume. */
  typicalVolume: number
  /** Last session's volume as a multiple of the typical volume. */
  relativeVolume: number
  trend: Trend
}

const listing = (
  market: Market,
  symbol: string,
  name: string,
  sector: string,
  price: number,
  changePercent: number,
  typicalVolume: number,
  relativeVolume: number,
  trend: Trend = 'range',
): Listing => ({
  symbol,
  market,
  name,
  sector,
  price,
  changePercent,
  typicalVolume,
  relativeVolume,
  trend,
})

// Tickers, names, prices and day changes of the US stocks follow the design reference.
const LISTINGS: Listing[] = [
  listing('US', 'NVDA', 'NVIDIA', 'Semiconductors', 182.42, 2.84, 182_000_000, 3.4),
  listing('US', 'MSFT', 'Microsoft', 'Software', 524.18, 0.92, 21_500_000, 1.1, 'up'),
  listing('US', 'GOOGL', 'Alphabet', 'Internet', 248.7, 1.35, 29_800_000, 1.2, 'up'),
  listing('US', 'AVGO', 'Broadcom', 'Semiconductors', 371.22, -0.44, 24_600_000, 0.9, 'up'),
  listing('US', 'TSM', 'TSMC', 'Semiconductors', 298.5, 1.72, 14_200_000, 2.8),
  listing('US', 'AMAT', 'Applied Materials', 'Semiconductors', 226.1, 0.76, 7_400_000, 2.5),
  listing('US', 'PANW', 'Palo Alto Networks', 'Cybersecurity', 205.82, -0.31, 6_100_000, 0.8),
  listing('US', 'ASML', 'ASML Holding', 'Semiconductors', 1042.2, 0.88, 1_600_000, 1.0),
  listing('US', 'PLTR', 'Palantir Technologies', 'Software', 151.2, 3.18, 64_000_000, 2.3),
  listing('US', 'AMD', 'Advanced Micro Devices', 'Semiconductors', 176.84, 2.31, 48_500_000, 2.1),
  listing('US', 'SOFI', 'SoFi Technologies', 'Financials', 24.63, 4.02, 52_000_000, 1.9),
  listing('US', 'COST', 'Costco', 'Consumer staples', 912.4, 1.12, 2_100_000, 1.0, 'up'),
  listing('US', 'CRWD', 'CrowdStrike', 'Cybersecurity', 468.15, 2.05, 3_900_000, 1.4, 'up'),
  listing('US', 'UBER', 'Uber Technologies', 'Technology', 96.38, 1.47, 17_800_000, 1.3, 'up'),
  listing('US', 'AAPL', 'Apple', 'Technology', 258.02, 0, 52_000_000, 0.9),
  listing('US', 'AMZN', 'Amazon', 'Internet', 221.4, -1.18, 41_000_000, 1.2, 'down'),
  listing('US', 'META', 'Meta Platforms', 'Internet', 712.55, 0.41, 12_300_000, 0.9),
  listing('US', 'NFLX', 'Netflix', 'Communication services', 1198.3, -2.06, 3_600_000, 1.6, 'down'),
  listing('US', 'JPM', 'JPMorgan Chase', 'Financials', 301.12, -0.65, 9_200_000, 0.8),
  listing('US', 'TSLA', 'Tesla', 'Automotive', 433.7, -1.92, 98_000_000, 1.1, 'down'),

  listing('AU', 'BHP', 'BHP Group', 'Materials', 45.12, 0, 9_800_000, 1.0),
  listing('AU', 'CBA', 'Commonwealth Bank', 'Financials', 172.35, 0.64, 2_300_000, 1.1, 'up'),
  listing('AU', 'CSL', 'CSL Limited', 'Healthcare', 248.9, -1.12, 1_200_000, 1.3, 'down'),
  listing('AU', 'NAB', 'National Australia Bank', 'Financials', 41.86, 0.38, 5_400_000, 0.9),
  listing('AU', 'WBC', 'Westpac Banking', 'Financials', 38.92, -0.21, 6_100_000, 0.8),
  listing('AU', 'ANZ', 'ANZ Group', 'Financials', 33.75, 0.51, 5_900_000, 1.0),
  listing('AU', 'MQG', 'Macquarie Group', 'Financials', 221.6, -0.27, 800_000, 0.9),
  listing('AU', 'WES', 'Wesfarmers', 'Consumer discretionary', 86.4, 0.35, 1_700_000, 1.0, 'up'),
  listing(
    'AU',
    'WOW',
    'Woolworths Group',
    'Consumer staples',
    29.84,
    -0.83,
    2_900_000,
    1.2,
    'down',
  ),
  listing('AU', 'COL', 'Coles Group', 'Consumer staples', 21.36, 0, 3_100_000, 0.9),
  listing('AU', 'FMG', 'Fortescue', 'Materials', 20.18, 3.05, 9_200_000, 2.4),
  listing('AU', 'RIO', 'Rio Tinto', 'Materials', 128.7, 1.21, 1_900_000, 1.6, 'up'),
  listing('AU', 'WTC', 'WiseTech Global', 'Technology', 118.5, 2.41, 900_000, 2.2),
  listing('AU', 'XRO', 'Xero', 'Technology', 172.8, -0.58, 650_000, 1.1),
  listing('AU', 'PLS', 'Pilbara Minerals', 'Materials', 2.86, 6.72, 38_000_000, 3.1),
  listing('AU', 'NXT', 'NEXTDC', 'Technology', 17.45, 1.98, 3_400_000, 1.9, 'up'),
  listing('AU', 'ZIP', 'Zip Co', 'Financials', 3.62, 5.24, 21_000_000, 2.9),
  listing('AU', 'LYC', 'Lynas Rare Earths', 'Materials', 12.84, 4.3, 8_600_000, 2.6),
  listing('AU', 'TLS', 'Telstra Group', 'Communication services', 4.98, 0.2, 24_000_000, 0.9),
  listing('AU', 'WDS', 'Woodside Energy', 'Energy', 24.15, -1.47, 6_800_000, 1.5, 'down'),
  listing('AU', 'STO', 'Santos', 'Energy', 6.92, -1.14, 9_300_000, 1.2, 'down'),
  listing('AU', 'RMD', 'ResMed', 'Healthcare', 41.3, -0.75, 1_100_000, 1.0),
  listing('AU', 'TCL', 'Transurban Group', 'Industrials', 14.22, 0.14, 4_700_000, 0.8, 'up'),
  listing('AU', 'GMG', 'Goodman Group', 'Real estate', 35.4, 1.62, 3_300_000, 1.8, 'up'),
  listing('AU', 'ALL', 'Aristocrat Leisure', 'Consumer discretionary', 68.95, 1.83, 1_500_000, 2.0),
  listing('AU', 'QBE', 'QBE Insurance', 'Financials', 21.48, -0.42, 3_800_000, 0.9),
  listing('AU', 'NST', 'Northern Star Resources', 'Materials', 22.64, 2.95, 6_200_000, 2.3),
  listing('AU', 'EVN', 'Evolution Mining', 'Materials', 9.87, 3.46, 14_000_000, 2.7),
  listing('AU', 'MIN', 'Mineral Resources', 'Materials', 42.3, -3.12, 2_600_000, 2.1, 'down'),
  listing(
    'AU',
    'IEL',
    'IDP Education',
    'Consumer discretionary',
    4.21,
    -6.24,
    5_100_000,
    3.5,
    'down',
  ),
  listing('AU', 'SGH', 'SGH Limited', 'Industrials', 52.1, 0.92, 900_000, 1.1, 'up'),
  listing('AU', 'REA', 'REA Group', 'Communication services', 238.6, 1.58, 300_000, 1.4, 'up'),
]

/** Weekdays ending on `last`, oldest first. Exchange holidays are ignored. */
function sessionDates(count: number, last: IsoDate): IsoDate[] {
  const dates: IsoDate[] = []
  const day = new Date(`${last}T00:00:00Z`)
  while (dates.length < count) {
    const weekday = day.getUTCDay()
    if (weekday !== 0 && weekday !== 6) dates.unshift(toIsoDate(day))
    day.setUTCDate(day.getUTCDate() - 1)
  }
  return dates
}

/** Prices are quoted to the cent; ASX stocks under $2 to a tenth of a cent. */
function tick(price: number) {
  const decimals = price < 2 ? 3 : 2
  return Number(price.toFixed(decimals))
}

/** Average daily drift by age: the first segment covers the newest sessions. */
const DRIFT: Record<Trend, { sessions: number; drift: number }[]> = {
  up: [
    { sessions: 5, drift: 0.016 },
    { sessions: 7, drift: -0.009 },
    { sessions: Infinity, drift: 0.003 },
  ],
  down: [
    { sessions: 14, drift: -0.005 },
    { sessions: Infinity, drift: 0.001 },
  ],
  range: [{ sessions: Infinity, drift: 0 }],
}

function driftAt(trend: Trend, age: number) {
  let start = 0
  for (const segment of DRIFT[trend]) {
    if (age < start + segment.sessions) return segment.drift
    start += segment.sessions
  }
  return 0
}

/**
 * Builds the history backwards from the last close, so the final two closes give exactly the
 * listing's price and day change.
 */
function buildHistory(item: Listing): PriceBar[] {
  const random = seededRandom(seedFrom(`${item.symbol}.${item.market}`))
  const n = PRICE_HISTORY_SESSIONS
  const dates = sessionDates(n, DEMO_AS_OF)

  const closes: number[] = new Array(n)
  closes[n - 1] = item.price
  closes[n - 2] = tick(item.price / (1 + item.changePercent / 100))
  for (let i = n - 3; i >= 0; i--) {
    // Age 0 is the move into the last session, already fixed by the day change.
    const drift = driftAt(item.trend, n - 2 - i)
    closes[i] = tick(closes[i + 1] / (1 + drift + (random() - 0.5) * 0.02))
  }

  // The last session trades the listing's multiple of the 20 sessions before it.
  const volumes = closes.map(() => Math.round(item.typicalVolume * (0.7 + random() * 0.6)))
  const average = Math.round(sum(volumes.slice(n - 21, n - 1)) / 20)
  volumes[n - 1] = Math.round(average * item.relativeVolume)

  return closes.map((close, i) => {
    const previous = i === 0 ? close : closes[i - 1]
    const open = tick(previous * (1 + (random() - 0.5) * 0.008 + (i === n - 1 ? 0.003 : 0)))
    return {
      date: dates[i],
      open,
      high: tick(Math.max(open, close) * (1 + random() * 0.01)),
      low: tick(Math.min(open, close) * (1 - random() * 0.01)),
      close,
      volume: volumes[i],
    }
  })
}

function quoteFrom(key: StockKey, bars: PriceBar[]): StockQuote {
  const last = bars[bars.length - 1]
  const previousClose = bars[bars.length - 2].close
  const prior20 = bars.slice(-21, -1).map((b) => b.volume)
  return {
    key,
    asOf: last.date,
    open: last.open,
    high: last.high,
    low: last.low,
    price: last.close,
    previousClose,
    ...priceChange(last.close, previousClose),
    volume: last.volume,
    averageVolume: Math.round(sum(prior20) / prior20.length),
  }
}

const stocks = new Map<StockKey, Stock>()
const histories = new Map<StockKey, PriceHistory>()
const quotes = new Map<StockKey, StockQuote>()

for (const item of LISTINGS) {
  const key = stockKey(item.symbol, item.market)
  const bars = buildHistory(item)
  stocks.set(key, {
    key,
    symbol: item.symbol,
    market: item.market,
    name: item.name,
    sector: item.sector,
    currency: MARKETS[item.market].currency,
  })
  histories.set(key, { key, bars })
  quotes.set(key, quoteFrom(key, bars))
}

function lookup<T>(map: Map<StockKey, T>, key: StockKey): T {
  const value = map.get(key)
  if (!value) throw new Error(`Unknown demo stock ${key}`)
  return value
}

export const demoStocks: Stock[] = [...stocks.values()]

export function demoStock(key: StockKey): Stock {
  return lookup(stocks, key)
}

export function demoQuote(key: StockKey): StockQuote {
  return lookup(quotes, key)
}

export function demoQuotedStock(key: StockKey): QuotedStock {
  return { stock: demoStock(key), quote: demoQuote(key) }
}

export function demoPriceHistory(key: StockKey): PriceHistory {
  return lookup(histories, key)
}
