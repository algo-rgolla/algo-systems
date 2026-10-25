import { delay, http, HttpResponse } from 'msw'
import type { ScanCounterListDto } from '@/api/types/dtos'
import { scanCounters } from '../fixtures/scans'

// '*' matches any origin, so the handlers also apply when VITE_API_BASE_URL is set.
export const scanHandlers = [
  http.get('*/api/longscan/scan-counters', async () => {
    await delay()
    return HttpResponse.json<ScanCounterListDto>(scanCounters)
  }),
]
