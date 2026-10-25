import type {
  ScanMetrics,
  ScanResult,
  ScanRun,
  ScanSignal,
  ScanType,
} from '@/features/stock-scans/types'
import { SCAN_TYPES } from '@/features/stock-scans/types'
import { ema } from '@/features/stocks/indicators'
import type { Market } from '@/features/stocks/markets'
import type { QuotedStock } from '@/features/stocks/types'
import { demoPriceHistory, demoQuotedStock, demoStocks } from './stocks'

/**
 * Simplified versions of the batch's scan rules (ScanBusinessLogic also applies MACD, EMA 125
 * and liquidity filters), applied to the demo universe. Membership, metrics and signals are all
 * computed from the demo quotes and price histories.
 */
export const SCAN_RULES = {
  // These are long scans, so heavy volume only counts on an up day.
  unusualVolume: { minRelativeVolume: 1.8, surge: 2.5 },
  bigGainers: { minChangePercent: 1.5, strong: 3 },
  // Constants.Scans: "EMA9 > 21 > 63". A cross within `fresh` sessions is the strong signal.
  emaCrossover: { fresh: 3 },
}

/** Both runs finished at 4:05 pm exchange time after the 23 Oct 2026 session (AEDT, EDT). */
const RUN_AT: Record<Market, string> = {
  AU: '2026-10-23T16:05:00+11:00',
  US: '2026-10-23T16:05:00-04:00',
}

const round1 = (value: number) => Math.round(value * 10) / 10
const clampScore = (value: number) => Math.min(9.9, Math.max(0, round1(value)))

function relativeVolume({ quote }: QuotedStock) {
  return quote.volume / quote.averageVolume
}

interface Candidate {
  item: QuotedStock
  score: number
  signal: ScanSignal
  metrics: ScanMetrics
}

function unusualVolume(item: QuotedStock): Candidate | null {
  const rv = relativeVolume(item)
  if (rv < SCAN_RULES.unusualVolume.minRelativeVolume || item.quote.changePercent <= 0) return null
  return {
    item,
    score: clampScore(6 + rv),
    signal:
      rv >= SCAN_RULES.unusualVolume.surge
        ? { label: 'Volume surge', strength: 'strong' }
        : { label: 'Above average', strength: 'moderate' },
    metrics: { scanType: 'unusual-volume', relativeVolume: rv },
  }
}

function bigGainer(item: QuotedStock): Candidate | null {
  const { quote } = item
  if (quote.changePercent < SCAN_RULES.bigGainers.minChangePercent) return null
  const rv = relativeVolume(item)
  return {
    item,
    score: clampScore(7 + quote.changePercent * 0.5 + (rv - 1) * 0.3),
    signal:
      quote.changePercent >= SCAN_RULES.bigGainers.strong
        ? { label: 'Momentum surge', strength: 'strong' }
        : { label: 'Steady gain', strength: 'moderate' },
    metrics: {
      scanType: 'big-gainers',
      gapPercent: ((quote.open - quote.previousClose) / quote.previousClose) * 100,
      relativeVolume: rv,
    },
  }
}

/** EMA 9 above EMA 21 above EMA 63, with the close above EMA 9. */
function emaCrossover(item: QuotedStock): Candidate | null {
  const bars = demoPriceHistory(item.stock.key).bars
  const closes = bars.map((b) => b.close)
  const [e9, e21, e63] = [9, 21, 63].map((period) => ema(closes, period))
  const last = closes.length - 1
  const ema9 = e9[last]
  const ema21 = e21[last]
  const ema63 = e63[last]
  if (ema9 == null || ema21 == null || ema63 == null) return null
  if (!(item.quote.price > ema9 && ema9 > ema21 && ema21 > ema63)) return null

  // Count back to the last session on which EMA 9 was at or below EMA 21.
  let sessionsSinceCross: number | null = 0
  for (;;) {
    const fast = e9[last - sessionsSinceCross - 1]
    const slow = e21[last - sessionsSinceCross - 1]
    if (fast == null || slow == null) {
      sessionsSinceCross = null // Above since before the EMAs start.
      break
    }
    if (fast <= slow) break
    sessionsSinceCross++
  }
  const age = sessionsSinceCross ?? Infinity

  return {
    item,
    // Stronger separation scores higher; older crosses slightly lower.
    score: clampScore(7 + (ema9 / ema63 - 1) * 40 - Math.min(age, 20) * 0.05),
    signal:
      age < SCAN_RULES.emaCrossover.fresh
        ? { label: 'Fresh crossover', strength: 'strong' }
        : { label: 'Trend confirmed', strength: 'moderate' },
    metrics: {
      scanType: 'ema-crossover',
      ema9,
      ema21,
      ema63,
      sessionsSinceCross,
      crossedOn: sessionsSinceCross == null ? null : bars[last - sessionsSinceCross].date,
    },
  }
}

const RULES: Record<ScanType, (item: QuotedStock) => Candidate | null> = {
  'unusual-volume': unusualVolume,
  'big-gainers': bigGainer,
  'ema-crossover': emaCrossover,
}

function runScan(scanType: ScanType, market: Market): ScanResult[] {
  return demoStocks
    .filter((stock) => stock.market === market)
    .map((stock) => RULES[scanType](demoQuotedStock(stock.key)))
    .filter((candidate): candidate is Candidate => candidate !== null)
    .sort((a, b) => b.score - a.score || b.item.quote.changePercent - a.item.quote.changePercent)
    .map((c, i) => ({
      ...c.item,
      scanType,
      rank: i + 1,
      score: c.score,
      signal: c.signal,
      metrics: c.metrics,
    }))
}

const MARKETS: Market[] = ['AU', 'US']

const results = new Map<string, ScanResult[]>()
for (const market of MARKETS) {
  for (const scanType of SCAN_TYPES) results.set(`${scanType}:${market}`, runScan(scanType, market))
}

export function demoScanResults(scanType: ScanType, market: Market): ScanResult[] {
  return results.get(`${scanType}:${market}`) ?? []
}

export const demoScanRuns: ScanRun[] = MARKETS.flatMap((market) =>
  SCAN_TYPES.map((scanType) => ({
    scanType,
    market,
    runAt: RUN_AT[market],
    resultCount: demoScanResults(scanType, market).length,
  })),
)
