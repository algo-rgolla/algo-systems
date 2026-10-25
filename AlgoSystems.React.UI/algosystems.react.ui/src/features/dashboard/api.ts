import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { MarketOverview } from './types'

/**
 * Proposed endpoint (served by the demo data until the API has it):
 * - GET /api/market/overview: index and futures quotes, used when the TradingView widget can't load
 */
export const dashboardKeys = {
  all: ['dashboard'] as const,
  marketOverview: () => [...dashboardKeys.all, 'market-overview'] as const,
}

export function useMarketOverview() {
  return useQuery({
    queryKey: dashboardKeys.marketOverview(),
    queryFn: ({ signal }) => httpClient.get<MarketOverview>('/api/market/overview', { signal }),
  })
}
