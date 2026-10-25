import type { StockKey } from '@/features/stocks/types'
import type { Watchlist, WatchlistItem } from '@/features/watchlist/types'
import { todayIsoDate } from '@/shared/formatting/dates'
import { demoQuotedStock, demoStocks } from './stocks'
import { demoWatchlist } from './watchlist'

/**
 * The demo watchlist as edited in this browser session. Added and removed stocks live here until
 * the page is reloaded; nothing is sent to a server.
 */
let items: WatchlistItem[] = [...demoWatchlist.items]

export function demoWatchlistState(): Watchlist {
  return { ...demoWatchlist, items: [...items] }
}

/** Adds a stock, enforcing the same rule as the form (each stock is watched once). */
export function addDemoWatchlistItem(key: StockKey): WatchlistItem {
  const stock = demoStocks.find((s) => s.key === key)
  if (!stock) throw new Error(`There is no demo market data for ${key}.`)
  if (items.some((i) => i.stock.key === key)) {
    throw new Error(`${stock.symbol} is already on your watchlist.`)
  }

  const item: WatchlistItem = {
    id: `w-${key}`,
    ...demoQuotedStock(key),
    addedAt: todayIsoDate(),
    note: null,
  }
  items = [...items, item]
  return item
}

export function removeDemoWatchlistItem(id: string): void {
  if (!items.some((i) => i.id === id)) throw new Error('That stock is no longer on your watchlist.')
  items = items.filter((i) => i.id !== id)
}

/** Restores the original demo watchlist (for tests). */
export function resetDemoWatchlist() {
  items = [...demoWatchlist.items]
}
