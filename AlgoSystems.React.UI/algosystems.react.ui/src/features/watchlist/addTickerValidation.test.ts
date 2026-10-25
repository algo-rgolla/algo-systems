import { describe, expect, it } from 'vitest'
import type { Stock } from '@/features/stocks/types'
import { resolveTicker, validateTicker } from './addTickerValidation'

const stock = (symbol: string, market: 'AU' | 'US'): Stock => ({
  key: `${symbol}.${market}`,
  symbol,
  market,
  name: symbol,
  sector: 'Test',
  currency: market === 'AU' ? 'AUD' : 'USD',
})

const stocks = [stock('BHP', 'AU'), stock('NVDA', 'US'), stock('RIO', 'AU'), stock('RIO', 'US')]

describe('resolveTicker', () => {
  it('finds a stock by symbol or key, ignoring case and spaces', () => {
    expect(resolveTicker('bhp', stocks)?.key).toBe('BHP.AU')
    expect(resolveTicker('  NVDA ', stocks)?.key).toBe('NVDA.US')
    expect(resolveTicker('rio.us', stocks)?.key).toBe('RIO.US')
  })

  it('needs the key when a symbol is on more than one market', () => {
    expect(resolveTicker('RIO', stocks)).toBeNull()
  })

  it('finds nothing for blank, partial or unknown text', () => {
    expect(resolveTicker('', stocks)).toBeNull()
    expect(resolveTicker('BH', stocks)).toBeNull()
    expect(resolveTicker('ZZZ', stocks)).toBeNull()
  })
})

describe('validateTicker', () => {
  const watched = new Set(['NVDA.US'] as const)

  it('accepts a stock that is not watched yet', () => {
    expect(validateTicker('BHP', stocks[0], watched)).toBeNull()
  })

  it('rejects a duplicate', () => {
    expect(validateTicker('NVDA', stocks[1], watched)).toBe('NVDA is already on your watchlist.')
  })

  it('asks for a ticker, or says nothing matched', () => {
    expect(validateTicker('  ', null, watched)).toMatch(/^Enter a ticker/)
    expect(validateTicker('ZZZ', null, watched)).toBe(
      'No demo stock matches “ZZZ”. Choose one from the list.',
    )
  })
})
