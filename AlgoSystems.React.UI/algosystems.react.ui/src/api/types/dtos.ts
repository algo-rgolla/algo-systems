/**
 * Wire types for AlgoSystems.Core.Api. These mirror the C# classes in the
 * BusinessObjects project exactly (ASP.NET serialises them as camelCase).
 *
 * Note that the API sends numbers and dates pre-formatted as strings
 * (e.g. "12.5", "1.234B", "04-10-2026"). Never use these types in components:
 * map them to domain models first (see features/stocks/model.ts).
 */

/** BusinessObjects.ProductViewModel */
export interface ProductDto {
  id: number
  portfolioId: number
  symbol: string | null
  exchange: string | null
  name: string | null
  volume: string | null
  openPrice: string | null
  /** dd-MM-yyyy */
  openDate: string | null
  /** dd-MM-yyyy */
  closeDate: string | null
  close: string | null
  change: string | null
  closePrice: string | null
  changePercent: string | null
  status: string | null
  /** Abbreviated, e.g. "1.234B", "56.7M", "980K" */
  marketCap: string | null
  industry: string | null
  sector: string | null
  profitLoss: string | null
  comments: string | null
  tradeDays: string | null
  sellReason: string | null
  buyReason: string | null
  stopLoss: string | null
  /** ISO date-time */
  scanDate: string
  scanType: string | null
  atr: string | null
  action: string | null
}

/** BusinessObjects.ProductsViewModel (also the shape of WatchlistDto) */
export interface ProductsDto {
  scanType: string | null
  productViewType: string | null
  pageTotal: number
  pageHeader: string | null
  products: ProductDto[] | null
}

/** BusinessObjects.ScanCounterDto */
export interface ScanCounterDto {
  scanTypeText: string | null
  scanType: string | null
  scanResultCount: number
}

/** BusinessObjects.ScanCounterListDto */
export interface ScanCounterListDto {
  isAdmin: boolean
  scanCounters: ScanCounterDto[]
}

/** BusinessObjects.StatisticItemDto */
export interface StatisticItemDto {
  id: number
  /** Always non-negative; the sign is implied by the label ("Realised Loss"). */
  statisticValue: number
  statisticLabel: string | null
}

/** BusinessObjects.StatisticsResponseDto */
export interface StatisticsResponseDto {
  scanType: string | null
  statistics: StatisticItemDto[] | null
}

/** BusinessObjects.AlgoProductViewModel (request body for add-edit-algo-portfolio) */
export interface AlgoProductRequestDto {
  algoPortfolioId: number
  /** ASX code, exactly 3 characters */
  symbol: string
  volume: number
  action: 'Buy' | 'Sell'
  openPrice: number
  closePrice?: number | null
}
