import type { MarketOverview, MarketQuote, MarketQuoteGroup } from '@/features/dashboard/types'
import { priceChange } from '@/features/stocks/calculations'
import { DEMO_AS_OF } from './stocks'

const quote = (
  group: MarketQuoteGroup,
  symbol: string,
  name: string,
  previousClose: number,
  open: number,
  high: number,
  low: number,
  value: number,
): MarketQuote => ({
  symbol,
  name,
  group,
  value,
  open,
  high,
  low,
  previousClose,
  ...priceChange(value, previousClose),
})

/**
 * Simulated index and futures levels for the market board's fallback, in the same symbols and
 * order as the TradingView widget. Not market data.
 */
export const demoMarketOverview: MarketOverview = {
  asOf: DEMO_AS_OF,
  simulated: true,
  quotes: [
    quote('Indices', 'SPX', 'S&P 500', 7568.1, 7571.4, 7641.9, 7560.2, 7612.4),
    quote('Indices', 'NDX', 'US Tech 100', 28702.55, 28720.1, 29018.3, 28688.4, 28940.15),
    quote('Indices', 'XJO', 'ASX 200', 8761.2, 8758.9, 8774.6, 8729.8, 8742.3),
    quote('Indices', 'DJI', 'Dow Jones', 51934.2, 51960.8, 52188.4, 51902.6, 52105.8),
    quote('Futures', 'GC', 'Gold', 4006.1, 4004.3, 4019.7, 3978.2, 3987.6),
    quote('Futures', 'CL', 'WTI Crude Oil', 101.84, 101.9, 103.6, 101.22, 103.12),
  ],
}
