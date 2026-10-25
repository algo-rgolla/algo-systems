/**
 * The app's data source: async functions over the deterministic demo data in ./data. Feature
 * query hooks call these; nothing here talks to a server. To connect a backend later, replace
 * these functions with HTTP calls that return the same types.
 */
import type { MarketOverview } from '@/features/dashboard/types'
import type {
  AddHoldingRequest,
  Portfolio,
  PortfolioHolding,
  PortfolioPerformance,
} from '@/features/portfolio/types'
import {
  SCAN_TYPES,
  type ScanResult,
  type ScanRun,
  type ScanType,
} from '@/features/stock-scans/types'
import type { Stock } from '@/features/stocks/types'
import { demoMarketOverview } from './data/marketData'
import { addDemoHolding, demoPortfolioPerformance, demoPortfolioState } from './data/portfolioStore'
import { demoScanResults, demoScanRuns } from './data/scans'
import { demoStocks } from './data/stocks'
import { demoRequest } from './request'

type Options = { signal?: AbortSignal }

export const demoServices = {
  scanRuns: ({ signal }: Options = {}): Promise<ScanRun[]> =>
    demoRequest('scans', () => demoScanRuns, { signal }),

  /** One scan's results on every market, best first within each market. */
  scanResults: (scanType: ScanType, { signal }: Options = {}): Promise<ScanResult[]> =>
    demoRequest(
      'scans',
      () => {
        if (!SCAN_TYPES.includes(scanType)) throw new Error(`Unknown scan ${scanType}.`)
        return [...demoScanResults(scanType, 'AU'), ...demoScanResults(scanType, 'US')]
      },
      { signal },
    ),

  marketOverview: ({ signal }: Options = {}): Promise<MarketOverview> =>
    demoRequest('market', () => demoMarketOverview, { signal }),

  stockDirectory: ({ signal }: Options = {}): Promise<Stock[]> =>
    demoRequest('stocks', () => demoStocks, { signal }),

  portfolio: ({ signal }: Options = {}): Promise<Portfolio> =>
    demoRequest('portfolio', demoPortfolioState, { signal }),

  portfolioPerformance: ({ signal }: Options = {}): Promise<PortfolioPerformance> =>
    demoRequest('portfolio', demoPortfolioPerformance, { signal }),

  /** Saves into this browser session's demo portfolio only. */
  addHolding: (request: AddHoldingRequest): Promise<PortfolioHolding> =>
    // Long enough to see the form's saving state.
    demoRequest('portfolio', () => addDemoHolding(request), { latencyMs: 700 }),
}
