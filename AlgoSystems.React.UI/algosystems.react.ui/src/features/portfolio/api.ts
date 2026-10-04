import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/api/client/httpClient'
import type { ProductsDto, StatisticsResponseDto } from '@/api/types/dtos'
import { toStockRows } from '@/features/stocks/model'

/** Realised/unrealised P&L for a strategy portfolio, signed. */
export interface PortfolioStatistics {
  realisedProfit: number
  realisedLoss: number
  unrealisedProfit: number
  unrealisedLoss: number
  realisedNet: number
  unrealisedNet: number
}

export const portfolioKeys = {
  all: ['portfolio'] as const,
  strategy: (scanType: string) => [...portfolioKeys.all, scanType] as const,
  positions: (scanType: string) => [...portfolioKeys.strategy(scanType), 'positions'] as const,
  history: (scanType: string) => [...portfolioKeys.strategy(scanType), 'history'] as const,
  statistics: (scanType: string) => [...portfolioKeys.strategy(scanType), 'statistics'] as const,
}

function toStatistics(dto: StatisticsResponseDto): PortfolioStatistics {
  // The API returns absolute values keyed by label; restore the signs here.
  const byLabel = new Map((dto.statistics ?? []).map((s) => [s.statisticLabel, s.statisticValue]))
  const realisedProfit = byLabel.get('Realised Profit') ?? 0
  const realisedLoss = -(byLabel.get('Realised Loss') ?? 0)
  const unrealisedProfit = byLabel.get('Current Profit') ?? 0
  const unrealisedLoss = -(byLabel.get('Current Loss') ?? 0)

  return {
    realisedProfit,
    realisedLoss,
    unrealisedProfit,
    unrealisedLoss,
    realisedNet: realisedProfit + realisedLoss,
    unrealisedNet: unrealisedProfit + unrealisedLoss,
  }
}

export const portfolioStatisticsQuery = (scanType: string) =>
  queryOptions({
    queryKey: portfolioKeys.statistics(scanType),
    queryFn: ({ signal }) =>
      httpClient.get<StatisticsResponseDto>('/api/Portfolio/portfolio-statistics', {
        query: { scanName: scanType },
        signal,
      }),
    select: toStatistics,
  })

export function usePortfolioStatistics(scanType: string) {
  return useQuery(portfolioStatisticsQuery(scanType))
}

export function useOpenPositions(scanType: string) {
  return useQuery({
    queryKey: portfolioKeys.positions(scanType),
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/Portfolio/portfolio-list', {
        query: { scanName: scanType },
        signal,
      }),
    select: toStockRows,
  })
}

export function useClosedPositions(scanType: string) {
  return useQuery({
    queryKey: portfolioKeys.history(scanType),
    queryFn: ({ signal }) =>
      httpClient.get<ProductsDto>('/api/eodhd/portfoliohistory', {
        query: { scanName: scanType },
        signal,
      }),
    select: toStockRows,
  })
}

export function useDeleteClosedPosition(scanType: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (portfolioId: number) =>
      httpClient.delete<boolean>(`/api/portfoliohistory/delete/${portfolioId}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: portfolioKeys.strategy(scanType) }),
  })
}
