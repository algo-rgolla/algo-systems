import { useQuery } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'

export const portfolioHistoryKeys = {
  all: ['portfolio-history'] as const,
  trades: () => [...portfolioHistoryKeys.all, 'trades'] as const,
}

export function usePortfolioHistory() {
  return useQuery({
    queryKey: portfolioHistoryKeys.trades(),
    queryFn: ({ signal }) => demoServices.portfolioHistory({ signal }),
  })
}
