import type { StockKey } from '@/features/stocks/types'
import type { Watchlist, WatchlistItem } from '@/features/watchlist/types'
import type { IsoDate } from '@/shared/formatting/dates'
import { demoQuotedStock } from './stocks'

const item = (key: StockKey, addedAt: IsoDate, note: string | null = null): WatchlistItem => ({
  id: `w-${key}`,
  ...demoQuotedStock(key),
  addedAt,
  note,
})

/** The reference's six watchlist stocks, plus three ASX stocks. */
export const demoWatchlist: Watchlist = {
  id: 'main',
  name: 'Watchlist',
  items: [
    item('NVDA.US', '2026-08-19', 'Earnings 19 Nov'),
    item('MSFT.US', '2026-09-01'),
    item('GOOGL.US', '2026-09-30'),
    item('AVGO.US', '2026-07-14', 'Wait for a pullback to the 21 EMA'),
    item('TSM.US', '2026-10-12'),
    item('ASML.US', '2026-06-18'),
    item('BHP.AU', '2026-07-02'),
    item('CSL.AU', '2026-10-20', 'Below the 63 EMA'),
    item('WTC.AU', '2026-09-30'),
  ],
}

/** A second list with nothing in it yet, for the empty state. */
export const demoEmptyWatchlist: Watchlist = { id: 'earnings', name: 'Earnings watch', items: [] }
