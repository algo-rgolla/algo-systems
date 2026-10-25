import { useQuery } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'
import { summariseScanRuns } from './model'
import type { ScanType } from './types'

export const scanKeys = {
  all: ['scans'] as const,
  runs: () => [...scanKeys.all, 'runs'] as const,
  results: (scanType: ScanType) => [...scanKeys.all, 'results', scanType] as const,
}

/** The latest run of each scan, totalled across markets. */
export function useScanSummaries() {
  return useQuery({
    queryKey: scanKeys.runs(),
    queryFn: ({ signal }) => demoServices.scanRuns({ signal }),
    select: summariseScanRuns,
  })
}

export function useScanResults(scanType: ScanType) {
  return useQuery({
    queryKey: scanKeys.results(scanType),
    queryFn: ({ signal }) => demoServices.scanResults(scanType, { signal }),
  })
}
