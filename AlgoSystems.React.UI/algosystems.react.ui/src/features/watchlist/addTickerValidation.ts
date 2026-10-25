import type { Stock, StockKey } from '@/features/stocks/types'

/**
 * The stock a typed ticker names: an exact symbol ("bhp") or key ("BHP.AU"), ignoring case.
 * A symbol listed on more than one market is ambiguous, so it needs its key.
 */
export function resolveTicker(text: string, stocks: readonly Stock[]): Stock | null {
  const query = text.trim().toUpperCase()
  if (query === '') return null
  const byKey = stocks.find((s) => s.key.toUpperCase() === query)
  if (byKey) return byKey
  const bySymbol = stocks.filter((s) => s.symbol === query)
  return bySymbol.length === 1 ? bySymbol[0] : null
}

/**
 * Why the stock can't be added, or null if it can. Duplicate policy: each stock is watched once,
 * so a stock already on the watchlist is rejected.
 */
export function validateTicker(
  text: string,
  stock: Stock | null,
  watchedKeys: ReadonlySet<StockKey>,
): string | null {
  if (stock) {
    return watchedKeys.has(stock.key) ? `${stock.symbol} is already on your watchlist.` : null
  }
  if (text.trim() === '') return 'Enter a ticker, or choose a stock from the list.'
  return `No demo stock matches “${text.trim()}”. Choose one from the list.`
}
