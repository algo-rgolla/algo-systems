import type { ProductDto, ProductsDto } from '@/api/types/dtos'
import {
  parseAbbreviatedNumber,
  parseDayMonthYear,
  parseIsoDate,
  parseNumber,
  textOrNull,
} from '@/shared/formatting/parse'

/**
 * A stock as the UI sees it: typed numbers and dates instead of the API's
 * pre-formatted strings. Used by the screener, watchlist and portfolio tables.
 */
export interface StockRow {
  /** Stable, unique key for grids. The API's ids are not unique across lists. */
  rowKey: string
  /** Watchlist id for watchlist rows; portfolio id for portfolio rows. */
  id: number
  portfolioId: number
  symbol: string
  name: string | null
  exchange: string | null
  sector: string | null
  industry: string | null
  close: number | null
  change: number | null
  changePercent: number | null
  marketCap: number | null
  volume: number | null
  openPrice: number | null
  closePrice: number | null
  openDate: Date | null
  closeDate: Date | null
  stopLoss: number | null
  atr: number | null
  profitLoss: number | null
  tradeDays: number | null
  status: string | null
  action: string | null
  buyReason: string | null
  sellReason: string | null
  comments: string | null
  scanType: string | null
  scanDate: Date | null
}

export function toStockRow(dto: ProductDto, index: number): StockRow {
  const symbol = dto.symbol?.trim() ?? ''

  return {
    rowKey: `${dto.id}-${dto.portfolioId}-${symbol}-${index}`,
    id: dto.id,
    portfolioId: dto.portfolioId,
    symbol,
    name: textOrNull(dto.name),
    exchange: textOrNull(dto.exchange),
    sector: textOrNull(dto.sector),
    industry: textOrNull(dto.industry),
    close: parseNumber(dto.close),
    change: parseNumber(dto.change),
    changePercent: parseNumber(dto.changePercent),
    marketCap: parseAbbreviatedNumber(dto.marketCap),
    volume: parseNumber(dto.volume),
    openPrice: parseNumber(dto.openPrice),
    closePrice: parseNumber(dto.closePrice),
    openDate: parseDayMonthYear(dto.openDate),
    closeDate: parseDayMonthYear(dto.closeDate),
    stopLoss: parseNumber(dto.stopLoss),
    atr: parseNumber(dto.atr),
    profitLoss: parseNumber(dto.profitLoss),
    tradeDays: parseNumber(dto.tradeDays),
    status: textOrNull(dto.status),
    action: textOrNull(dto.action),
    buyReason: textOrNull(dto.buyReason),
    sellReason: textOrNull(dto.sellReason),
    comments: textOrNull(dto.comments),
    scanType: textOrNull(dto.scanType),
    scanDate: parseIsoDate(dto.scanDate),
  }
}

export function toStockRows(dto: ProductsDto | null | undefined): StockRow[] {
  return (dto?.products ?? []).map(toStockRow)
}

/** Return on capital for a position, in percent. */
export function positionReturnPercent(row: StockRow): number | null {
  if (row.profitLoss == null || row.openPrice == null || row.volume == null) return null
  const cost = row.openPrice * row.volume
  return cost > 0 ? (row.profitLoss / cost) * 100 : null
}
