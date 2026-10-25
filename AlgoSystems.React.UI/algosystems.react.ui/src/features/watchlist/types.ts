import type { QuotedStock } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'

export interface WatchlistItem extends QuotedStock {
  id: string
  addedAt: IsoDate
  note: string | null
}

export interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
}
