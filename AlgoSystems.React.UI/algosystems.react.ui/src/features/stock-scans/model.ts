import type { Market } from '@/features/stocks/markets'
import type { IsoDateTime } from '@/shared/formatting/dates'
import { SCAN_TYPES, type ScanRun, type ScanType } from './types'

/** One scan's latest results across markets, for the scan selector tiles. */
export interface ScanSummary {
  scanType: ScanType
  resultCount: number
  countByMarket: Partial<Record<Market, number>>
  /** The most recent run of this scan on any market. */
  lastRunAt: IsoDateTime | null
}

/** Totals runs per scan type, in display order; scans that have not run count as zero. */
export function summariseScanRuns(runs: ScanRun[]): ScanSummary[] {
  return SCAN_TYPES.map((scanType) => {
    const own = runs.filter((run) => run.scanType === scanType)
    return {
      scanType,
      resultCount: own.reduce((total, run) => total + run.resultCount, 0),
      countByMarket: Object.fromEntries(own.map((run) => [run.market, run.resultCount])),
      lastRunAt:
        own.map((run) => run.runAt).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null,
    }
  })
}

/** Reads a scan type from a URL parameter, falling back to the first scan. */
export function parseScanType(value: string | null): ScanType {
  return SCAN_TYPES.find((type) => type === value) ?? SCAN_TYPES[0]
}
