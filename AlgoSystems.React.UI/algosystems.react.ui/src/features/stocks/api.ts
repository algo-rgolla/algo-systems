import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { Stock } from './types'

/**
 * Proposed endpoint (served by the demo data until the API has it):
 * - GET /api/stocks: every listed stock the app has prices for, for symbol lookup
 */
export const stockKeys = {
  all: ['stocks'] as const,
  directory: () => [...stockKeys.all, 'directory'] as const,
}

export function useStockDirectory() {
  return useQuery({
    queryKey: stockKeys.directory(),
    queryFn: ({ signal }) => httpClient.get<Stock[]>('/api/stocks', { signal }),
    // The list of listed stocks changes rarely.
    staleTime: 60 * 60 * 1000,
  })
}
