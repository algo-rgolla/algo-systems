import { queryOptions, useQuery } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { ProductsDto, ScanCounterListDto } from '@/api/types/dtos'
import { toStockRows } from '@/features/stocks/model'
import { scanLabel } from '@/features/stocks/scans'

export interface ScanCounter {
  scanType: string
  label: string
  count: number
}

export const screenerKeys = {
  all: ['screener'] as const,
  counters: () => [...screenerKeys.all, 'counters'] as const,
  results: (scanType: string) => [...screenerKeys.all, 'results', scanType] as const,
}

export const scanCountersQuery = () =>
  queryOptions({
    queryKey: screenerKeys.counters(),
    queryFn: ({ signal }) =>
      httpClient.get<ScanCounterListDto>('/api/longscan/scan-counters', { signal }),
    select: (dto): ScanCounter[] =>
      dto.scanCounters
        .filter((c) => c.scanType)
        .map((c) => ({
          scanType: c.scanType!,
          label: c.scanTypeText || scanLabel(c.scanType!),
          count: c.scanResultCount,
        })),
  })

export function useScanCounters() {
  return useQuery(scanCountersQuery())
}

export function useScanResults(scanType: string | null) {
  return useQuery({
    queryKey: screenerKeys.results(scanType ?? ''),
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/longscan/get-scan-result', {
        query: { scanName: scanType },
        signal,
      }),
    select: toStockRows,
    enabled: Boolean(scanType),
  })
}
