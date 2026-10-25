import { delay, http, HttpResponse } from 'msw'
import type { ScanCounterListDto } from '@/api/types/dtos'
import type { ScanType } from '@/features/stock-scans/types'
import { SCANS } from '@/features/stocks/scans'
import { demoScanRuns } from '../data/scans'

/** The API's scan ids for the ASX runs that the existing scan-counters endpoint reports. */
const LEGACY_SCAN_IDS: Record<ScanType, { id: string; label: string }> = {
  'unusual-volume': { id: SCANS.longUnusualVolume, label: 'Unusual Volume' },
  'big-gainers': { id: SCANS.longBigGainers, label: 'Big Gainers' },
  'ema-crossover': { id: SCANS.longEmaCrossover, label: 'EMA Crossover' },
}

// '*' matches any origin, so the handlers also apply when VITE_API_BASE_URL is set.
export const scanHandlers = [
  http.get('*/api/longscan/scan-counters', async () => {
    await delay()
    return HttpResponse.json<ScanCounterListDto>({
      isAdmin: false,
      scanCounters: demoScanRuns
        .filter((run) => run.market === 'AU')
        .map((run) => ({
          scanType: LEGACY_SCAN_IDS[run.scanType].id,
          scanTypeText: LEGACY_SCAN_IDS[run.scanType].label,
          scanResultCount: run.resultCount,
        })),
    })
  }),
]
