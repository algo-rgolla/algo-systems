import type { Market } from '@/features/stocks/markets'
import type { ScanMetrics, ScanResult } from './types'

/** A score at or above this counts as a strong match, as in the design's summary strip. */
export const STRONG_SCORE = 8.5

export const MIN_SCORE_OPTIONS = [0, 7, 8, 8.5, 9] as const

export interface ScanFilters {
  /** Matches the start of the symbol or any part of the company name. */
  search: string
  market: Market | 'all'
  sector: string | 'all'
  signal: string | 'all'
  minScore: number
}

export const DEFAULT_SCAN_FILTERS: ScanFilters = {
  search: '',
  market: 'all',
  sector: 'all',
  signal: 'all',
  minScore: 0,
}

export function hasActiveFilters(filters: ScanFilters): boolean {
  return (Object.keys(DEFAULT_SCAN_FILTERS) as (keyof ScanFilters)[]).some(
    (key) => filters[key] !== DEFAULT_SCAN_FILTERS[key],
  )
}

export function filterScanResults(results: ScanResult[], filters: ScanFilters): ScanResult[] {
  const search = filters.search.trim().toLowerCase()
  return results.filter(
    (r) =>
      (search === '' ||
        r.stock.symbol.toLowerCase().startsWith(search) ||
        r.stock.name.toLowerCase().includes(search)) &&
      (filters.market === 'all' || r.stock.market === filters.market) &&
      (filters.sector === 'all' || r.stock.sector === filters.sector) &&
      (filters.signal === 'all' || r.signal.label === filters.signal) &&
      r.score >= filters.minScore,
  )
}

/** The sectors and signals present in a scan's results, for its filter menus. */
export function scanFilterOptions(results: ScanResult[]) {
  const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b))
  return {
    sectors: unique(results.map((r) => r.stock.sector)),
    signals: unique(results.map((r) => r.signal.label)),
  }
}

export interface ScanResultsSummary {
  count: number
  strongCount: number
}

export function summariseScanResults(results: ScanResult[]): ScanResultsSummary {
  return {
    count: results.length,
    strongCount: results.filter((r) => r.score >= STRONG_SCORE).length,
  }
}

export type CrossoverDirection = 'bullish' | 'bearish'

/** Bullish when the short EMA is above the long one. */
export function crossoverDirection(
  metrics: Extract<ScanMetrics, { scanType: 'ema-crossover' }>,
): CrossoverDirection {
  return metrics.ema9 > metrics.ema21 ? 'bullish' : 'bearish'
}
