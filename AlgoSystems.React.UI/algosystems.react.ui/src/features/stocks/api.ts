import { useQuery } from '@tanstack/react-query'
import { demoServices } from '@/demo/services'

export const stockKeys = {
  all: ['stocks'] as const,
  directory: () => [...stockKeys.all, 'directory'] as const,
}

/** Every stock the app has (demo) prices for, for symbol lookup. */
export function useStockDirectory() {
  return useQuery({
    queryKey: stockKeys.directory(),
    queryFn: ({ signal }) => demoServices.stockDirectory({ signal }),
    staleTime: Infinity,
  })
}
