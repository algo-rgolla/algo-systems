import { describe, expect, it } from 'vitest'
import { demoScanResults } from '@/demo/data/scans'
import {
  crossoverDirection,
  DEFAULT_SCAN_FILTERS,
  filterScanResults,
  hasActiveFilters,
  scanFilterOptions,
  STRONG_SCORE,
  summariseScanResults,
} from './filters'
import { SCAN_TYPES, type ScanType } from './types'

const resultsFor = (scanType: ScanType) => [
  ...demoScanResults(scanType, 'AU'),
  ...demoScanResults(scanType, 'US'),
]

describe('scan filters', () => {
  it('returns every result with the default filters', () => {
    for (const scanType of SCAN_TYPES) {
      const all = resultsFor(scanType)
      expect(filterScanResults(all, DEFAULT_SCAN_FILTERS)).toEqual(all)
      expect(hasActiveFilters(DEFAULT_SCAN_FILTERS)).toBe(false)
    }
  })

  it('searches the start of the symbol and anywhere in the company name', () => {
    const all = resultsFor('unusual-volume')
    const bySymbol = filterScanResults(all, { ...DEFAULT_SCAN_FILTERS, search: 'nv' })
    expect(bySymbol.map((r) => r.stock.symbol)).toEqual(['NVDA'])
    const byName = filterScanResults(all, { ...DEFAULT_SCAN_FILTERS, search: '  MINERALS ' })
    expect(byName.map((r) => r.stock.symbol)).toEqual(['PLS'])
    expect(filterScanResults(all, { ...DEFAULT_SCAN_FILTERS, search: 'zzz' })).toEqual([])
  })

  it('filters by market, sector, signal and minimum score together', () => {
    const all = resultsFor('big-gainers')
    const filters = {
      ...DEFAULT_SCAN_FILTERS,
      market: 'AU' as const,
      sector: 'Materials',
      signal: 'Momentum surge',
      minScore: 9,
    }
    const filtered = filterScanResults(all, filters)
    expect(filtered.length).toBeGreaterThan(0)
    for (const r of filtered) {
      expect(r.stock.market).toBe('AU')
      expect(r.stock.sector).toBe('Materials')
      expect(r.signal.label).toBe('Momentum surge')
      expect(r.score).toBeGreaterThanOrEqual(9)
    }
    expect(hasActiveFilters(filters)).toBe(true)
  })

  it('offers only the sectors and signals present in the selected scan', () => {
    const options = scanFilterOptions(resultsFor('unusual-volume'))
    expect(options.signals).toEqual(['Above average', 'Volume surge'])
    expect(options.sectors).toContain('Materials')
    expect(scanFilterOptions(resultsFor('ema-crossover')).signals).toEqual([
      'Fresh crossover',
      'Trend confirmed',
    ])
  })

  it('summarises the results in view', () => {
    const all = resultsFor('unusual-volume')
    const summary = summariseScanResults(all)
    expect(summary.count).toBe(all.length)
    expect(summary.strongCount).toBe(all.filter((r) => r.score >= STRONG_SCORE).length)
    expect(summariseScanResults([])).toEqual({ count: 0, strongCount: 0 })
  })

  it('labels every EMA crossover result bullish (EMA 9 above EMA 21)', () => {
    for (const r of resultsFor('ema-crossover')) {
      if (r.metrics.scanType !== 'ema-crossover') throw new Error('Unexpected metrics')
      expect(crossoverDirection(r.metrics)).toBe('bullish')
    }
    expect(
      crossoverDirection({
        scanType: 'ema-crossover',
        ema9: 1,
        ema21: 2,
        ema63: 3,
        sessionsSinceCross: null,
        crossedOn: null,
      }),
    ).toBe('bearish')
  })
})
