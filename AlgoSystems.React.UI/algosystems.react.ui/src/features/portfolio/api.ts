import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'
import { toPortfolioView } from './calculations'
import type { AddHoldingRequest } from './types'

export const portfolioKeys = {
  all: ['portfolio'] as const,
  detail: () => [...portfolioKeys.all, 'detail'] as const,
  performance: () => [...portfolioKeys.all, 'performance'] as const,
}

export function usePortfolio() {
  return useQuery({
    queryKey: portfolioKeys.detail(),
    queryFn: ({ signal }) => demoServices.portfolio({ signal }),
    select: toPortfolioView,
  })
}

export function usePortfolioPerformance() {
  return useQuery({
    queryKey: portfolioKeys.performance(),
    queryFn: ({ signal }) => demoServices.portfolioPerformance({ signal }),
  })
}

export function useAddHoldingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AddHoldingRequest) => demoServices.addHolding(request),
    // Returned, so `mutateAsync` resolves only once the summary and table have refreshed.
    onSettled: () => queryClient.invalidateQueries({ queryKey: portfolioKeys.all }),
  })
}
