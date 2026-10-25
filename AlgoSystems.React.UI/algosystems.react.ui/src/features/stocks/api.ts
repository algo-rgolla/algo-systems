import { useQuery } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'
import type { StockKey } from './types'

export const stockKeys = {
  all: ['stocks'] as const,
  directory: () => [...stockKeys.all, 'directory'] as const,
  history: (key: StockKey) => [...stockKeys.all, 'history', key] as const,
}

/** Every stock the app has (demo) prices for, for symbol lookup. */
export function useStockDirectory() {
  return useQuery({
    queryKey: stockKeys.directory(),
    queryFn: ({ signal }) => demoServices.stockDirectory({ signal }),
    staleTime: Infinity,
  })
}

/** Daily price bars for one stock, oldest first. */
export function usePriceHistory(key: StockKey) {
  return useQuery({
    queryKey: stockKeys.history(key),
    queryFn: ({ signal }) => demoServices.priceHistory(key, { signal }),
  })
}
