import type { ListQuery } from '@/api/types/query'
import type { Market } from '@/features/stocks/markets'
import type { QuotedStock } from '@/features/stocks/types'
import type { IsoDateTime } from '@/shared/formatting/dates'

/** The three scans the batch runs every evening, in display order. */
export const SCAN_TYPES = ['unusual-volume', 'big-gainers', 'ema-crossover'] as const

export type ScanType = (typeof SCAN_TYPES)[number]

export type SignalStrength = 'strong' | 'moderate'

/** The scan's one-line verdict on a result, shown as a pill. */
export interface ScanSignal {
  label: string
  strength: SignalStrength
}

/** Figures specific to each scan, used for its extra table column. */
export type ScanMetrics =
  | {
      scanType: 'unusual-volume'
      /** Session volume ÷ 20-session average volume. */
      relativeVolume: number
    }
  | {
      scanType: 'big-gainers'
      /** Open vs previous close, in percent. */
      gapPercent: number
      relativeVolume: number
    }
  | {
      scanType: 'ema-crossover'
      ema9: number
      ema21: number
      ema63: number
      /** Sessions since EMA 9 crossed above EMA 21; null if before the available history. */
      sessionsSinceCross: number | null
    }

export interface ScanResult extends QuotedStock {
  scanType: ScanType
  /** 1 = best match. Results are ordered by rank. */
  rank: number
  /** The scan's confidence, 0–10. */
  score: number
  signal: ScanSignal
  metrics: ScanMetrics
}

/** One evening's run of one scan on one market. */
export interface ScanRun {
  scanType: ScanType
  market: Market
  /** When the batch finished, with the exchange's UTC offset. */
  runAt: IsoDateTime
  resultCount: number
}

export type ScanResultSortField = 'rank' | 'symbol' | 'price' | 'changePercent' | 'score'

export type ScanResultQuery = ListQuery<ScanResultSortField, { sector: string }>
