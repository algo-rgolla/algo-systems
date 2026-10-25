import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import { summariseScanRuns } from './model'
import type { ScanRun } from './types'

/**
 * Proposed endpoints (served by the demo data until the API has them):
 * - GET /api/scans/runs: the latest run of every scan on every market
 */
export const scanKeys = {
  all: ['scans'] as const,
  runs: () => [...scanKeys.all, 'runs'] as const,
}

export function useScanSummaries() {
  return useQuery({
    queryKey: scanKeys.runs(),
    queryFn: ({ signal }) => httpClient.get<ScanRun[]>('/api/scans/runs', { signal }),
    select: summariseScanRuns,
  })
}
