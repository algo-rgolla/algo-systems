import { delay, http, HttpResponse } from 'msw'
import type { MarketOverview } from '@/features/dashboard/types'
import { demoMarketOverview } from '../data/marketData'

export const marketHandlers = [
  http.get('*/api/market/overview', async () => {
    await delay()
    return HttpResponse.json<MarketOverview>(demoMarketOverview)
  }),
]
