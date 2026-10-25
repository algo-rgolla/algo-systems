import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'
import type { AddWatchlistItemRequest } from './types'

export const watchlistKeys = {
  all: ['watchlist'] as const,
  detail: () => [...watchlistKeys.all, 'detail'] as const,
}

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKeys.detail(),
    queryFn: ({ signal }) => demoServices.watchlist({ signal }),
  })
}

export function useAddToWatchlistMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ key }: AddWatchlistItemRequest) => demoServices.addToWatchlist(key),
    // Returned, so `mutateAsync` resolves only once the cards have refreshed.
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKeys.all }),
  })
}

export function useRemoveFromWatchlistMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => demoServices.removeFromWatchlist(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKeys.all }),
  })
}
