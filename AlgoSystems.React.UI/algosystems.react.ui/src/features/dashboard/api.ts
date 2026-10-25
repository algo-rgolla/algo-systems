import { useQuery } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  marketOverview: () => [...dashboardKeys.all, 'market-overview'] as const,
}

/** Simulated index and futures quotes, used when the TradingView widget can't load. */
export function useMarketOverview() {
  return useQuery({
    queryKey: dashboardKeys.marketOverview(),
    queryFn: ({ signal }) => demoServices.marketOverview({ signal }),
  })
}
