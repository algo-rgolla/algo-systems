import { afterEach, describe, expect, it } from 'vitest'
import { demoQuotedStock } from './stocks'
import { demoWatchlist } from './watchlist'
import {
  addDemoWatchlistItem,
  demoWatchlistState,
  removeDemoWatchlistItem,
  resetDemoWatchlist,
} from './watchlistStore'

afterEach(resetDemoWatchlist)

describe('demo watchlist store', () => {
  it('adds a stock at the end with the same quote as everywhere else', () => {
    const item = addDemoWatchlistItem('XRO.AU')
    const { items } = demoWatchlistState()

    expect(items).toHaveLength(demoWatchlist.items.length + 1)
    expect(items.at(-1)).toEqual(item)
    expect(item).toMatchObject(demoQuotedStock('XRO.AU'))
  })

  it('rejects a stock that is already watched, and unknown stocks', () => {
    expect(() => addDemoWatchlistItem('NVDA.US')).toThrow('NVDA is already on your watchlist.')
    addDemoWatchlistItem('XRO.AU')
    expect(() => addDemoWatchlistItem('XRO.AU')).toThrow('already on your watchlist')
    expect(() => addDemoWatchlistItem('NOPE.AU')).toThrow('no demo market data')
    expect(demoWatchlistState().items).toHaveLength(demoWatchlist.items.length + 1)
  })

  it('removes a stock, and it can then be added again', () => {
    removeDemoWatchlistItem('w-NVDA.US')
    expect(demoWatchlistState().items.map((i) => i.stock.key)).not.toContain('NVDA.US')
    expect(() => removeDemoWatchlistItem('w-NVDA.US')).toThrow('no longer on your watchlist')

    addDemoWatchlistItem('NVDA.US')
    expect(demoWatchlistState().items.at(-1)?.stock.key).toBe('NVDA.US')
  })

  it('can be emptied, and hands out copies', () => {
    for (const item of demoWatchlist.items) removeDemoWatchlistItem(item.id)
    expect(demoWatchlistState().items).toEqual([])

    demoWatchlistState().items.push(demoWatchlist.items[0])
    expect(demoWatchlistState().items).toEqual([])
  })
})
