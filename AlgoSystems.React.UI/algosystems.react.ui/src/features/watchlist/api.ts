import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { ProductsDto } from '@/api/types/dtos'
import { toStockRows } from '@/features/stocks/model'

export const watchlistKeys = {
  all: ['watchlist'] as const,
}

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKeys.all,
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/eodhd/products/watchlist', { signal }),
    select: toStockRows,
  })
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => httpClient.delete<boolean>(`/api/watchlist/delete/${id}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKeys.all }),
  })
}
