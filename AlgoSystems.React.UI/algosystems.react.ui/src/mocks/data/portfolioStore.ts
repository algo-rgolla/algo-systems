import { averageCostFor, portfolioValueSeries } from '@/features/portfolio/calculations'
import type {
  AddHoldingRequest,
  Portfolio,
  PortfolioHolding,
  PortfolioPerformance,
} from '@/features/portfolio/types'
import { demoPortfolio } from './portfolio'
import { DEMO_FX_RATES, demoPriceHistory, demoQuotedStock, demoStocks } from './stocks'

/** An error the demo API answers with, as the real API would (status and plain-text message). */
export class DemoApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

/**
 * The demo portfolio as edited in this browser session. Holdings added through the demo API
 * live here until the page is reloaded; nothing is sent to a server.
 */
let holdings: PortfolioHolding[] = [...demoPortfolio.holdings]

export function demoPortfolioState(): Portfolio {
  return { ...demoPortfolio, holdings: [...holdings] }
}

export function demoPortfolioPerformance(): PortfolioPerformance {
  return {
    baseCurrency: demoPortfolio.baseCurrency,
    points: portfolioValueSeries(holdings, (key) => demoPriceHistory(key).bars, DEMO_FX_RATES),
  }
}

/** Adds a holding, enforcing the same rules as the form (one holding per stock). */
export function addDemoHolding(request: AddHoldingRequest): PortfolioHolding {
  const stock = demoStocks.find((s) => s.key === request.key)
  if (!stock) throw new DemoApiError(400, `No demo market data for ${request.key}.`)
  if (holdings.some((h) => h.stock.key === request.key)) {
    throw new DemoApiError(409, `You already hold ${stock.symbol}.`)
  }
  if (!(request.quantity > 0) || !(request.price > 0) || !(request.fees >= 0)) {
    throw new DemoApiError(400, 'Quantity and price must be more than 0, and fees 0 or more.')
  }

  const holding: PortfolioHolding = {
    id: `h-${request.key}`,
    ...demoQuotedStock(request.key),
    side: 'long',
    quantity: request.quantity,
    averageCost: averageCostFor(request, stock.currency, DEMO_FX_RATES),
    openedAt: request.purchaseDate,
    note: request.note,
  }
  holdings = [...holdings, holding]
  return holding
}

/** Restores the original demo holdings (for tests). */
export function resetDemoPortfolio() {
  holdings = [...demoPortfolio.holdings]
}
