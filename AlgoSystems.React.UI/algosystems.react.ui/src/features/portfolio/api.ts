import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import { toPortfolioView } from './calculations'
import type {
  AddHoldingRequest,
  Portfolio,
  PortfolioHolding,
  PortfolioPerformance,
} from './types'

/**
 * Proposed endpoints (served by the demo data until the API has them):
 * - GET /api/portfolio: the manual portfolio with its holdings and latest quotes
 * - GET /api/portfolio/performance: daily market value of the holdings
 * - POST /api/portfolio/holdings: add a holding (409 if the stock is already held)
 */
export const portfolioKeys = {
  all: ['portfolio'] as const,
  detail: () => [...portfolioKeys.all, 'detail'] as const,
  performance: () => [...portfolioKeys.all, 'performance'] as const,
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.detail(),
    queryFn: ({ signal }) => httpClient.get<Portfolio>('/api/portfolio', { signal }),
    select: toPortfolioView,
  })
}

export function usePortfolioPerformance() {
  return useQuery({
    queryKey: portfolioKeys.performance(),
    queryFn: ({ signal }) =>
      httpClient.get<PortfolioPerformance>('/api/portfolio/performance', { signal }),
  })
}

export function useAddHoldingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AddHoldingRequest) =>
      httpClient.post<PortfolioHolding>('/api/portfolio/holdings', request),
    // Returned, so `mutateAsync` resolves only once the summary and table have refetched.
    onSettled: () => queryClient.invalidateQueries({ queryKey: portfolioKeys.all }),
  })
}
