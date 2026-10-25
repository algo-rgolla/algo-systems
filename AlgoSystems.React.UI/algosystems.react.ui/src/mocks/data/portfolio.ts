import type { Portfolio, PortfolioHolding } from '@/features/portfolio/types'
import type { StockKey } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import { DEMO_AS_OF, DEMO_FX_RATES, demoQuotedStock } from './stocks'

const holding = (
  key: StockKey,
  quantity: number,
  averageCost: number,
  openedAt: IsoDate,
): PortfolioHolding => ({
  id: `h-${key}`,
  ...demoQuotedStock(key),
  side: 'long',
  quantity,
  averageCost,
  openedAt,
  note: null,
})

/**
 * Twelve open holdings, as in the reference's "Across 12 positions": its eight US stocks plus
 * four ASX stocks. BHP's average cost equals its (unchanged) price, so it shows no gain or loss.
 * Totals, return, day change, cash share and sector weights are derived; see summarisePortfolio.
 */
export const demoPortfolio: Portfolio = {
  id: 'main',
  name: 'My portfolio',
  baseCurrency: 'AUD',
  cash: 42_500,
  fxRates: DEMO_FX_RATES,
  asOf: DEMO_AS_OF,
  holdings: [
    holding('NVDA.US', 120, 138.5, '2025-11-14'),
    holding('MSFT.US', 40, 455.2, '2026-01-20'),
    holding('GOOGL.US', 70, 201.3, '2026-02-09'),
    holding('AVGO.US', 30, 389.0, '2026-09-30'),
    holding('TSM.US', 45, 241.8, '2026-03-17'),
    holding('AMAT.US', 35, 214.6, '2026-04-22'),
    holding('PANW.US', 40, 214.0, '2026-09-01'),
    holding('ASML.US', 8, 912.4, '2026-05-12'),
    holding('BHP.AU', 594, 45.12, '2026-10-12'),
    holding('CBA.AU', 120, 136.0, '2025-12-08'),
    holding('CSL.AU', 60, 276.4, '2026-06-03'),
    holding('WTC.AU', 160, 96.25, '2026-02-25'),
  ],
}

/** The same account with nothing invested, for empty states. */
export const demoEmptyPortfolio: Portfolio = { ...demoPortfolio, id: 'empty', holdings: [] }
