import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { AlgoProductRequestDto, ProductsDto } from '@/api/types/dtos'
import { toStockRows } from '@/features/stocks/model'

/** Manually recorded trades (the AlgoPortfolios table), separate from strategy portfolios. */
export const tradeKeys = {
  all: ['trades'] as const,
  open: () => [...tradeKeys.all, 'open'] as const,
  closed: () => [...tradeKeys.all, 'closed'] as const,
}

export function useOpenTrades() {
  return useQuery({
    queryKey: tradeKeys.open(),
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/AlgoPortfolio/algo-portfolio-list', { signal }),
    select: toStockRows,
  })
}

export function useClosedTrades() {
  return useQuery({
    queryKey: tradeKeys.closed(),
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/AlgoPortfolio/algo-portfolio-history', {
        // Required by the endpoint's model binding but not used for filtering.
        query: { scanName: 'Algo_Portfolio' },
        signal,
      }),
    select: toStockRows,
  })
}

export function useSaveTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (trade: AlgoProductRequestDto) =>
      httpClient.post<string>('/api/AlgoPortfolio/add-edit-algo-portfolio', trade),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tradeKeys.all }),
  })
}

export function useDeleteTrade() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (algoPortfolioId: number) =>
      httpClient.delete<string>(`/api/AlgoPortfolio/delete-algo-portfolio/${algoPortfolioId}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: tradeKeys.all }),
  })
}
