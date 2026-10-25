import { delay, http, HttpResponse } from 'msw'
import type { ScanRun } from '@/features/stock-scans/types'
import { demoScanRuns } from '../data/scans'

// '*' matches any origin, so the handlers also apply when VITE_API_BASE_URL is set.
export const scanHandlers = [
  http.get('*/api/scans/runs', async () => {
    await delay()
    return HttpResponse.json<ScanRun[]>(demoScanRuns)
  }),
]
