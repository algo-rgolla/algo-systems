import { delay, http, HttpResponse } from 'msw'
import type {
  AddHoldingRequest,
  Portfolio,
  PortfolioHolding,
  PortfolioPerformance,
} from '@/features/portfolio/types'
import type { Stock } from '@/features/stocks/types'
import {
  addDemoHolding,
  DemoApiError,
  demoPortfolioPerformance,
  demoPortfolioState,
} from '../data/portfolioStore'
import { demoStocks } from '../data/stocks'

export const portfolioHandlers = [
  http.get('*/api/portfolio', async () => {
    await delay()
    return HttpResponse.json<Portfolio>(demoPortfolioState())
  }),

  http.get('*/api/portfolio/performance', async () => {
    await delay()
    return HttpResponse.json<PortfolioPerformance>(demoPortfolioPerformance())
  }),

  http.post('*/api/portfolio/holdings', async ({ request }) => {
    // Long enough to see the form's saving state.
    await delay(700)
    try {
      const body = (await request.json()) as AddHoldingRequest
      return HttpResponse.json<PortfolioHolding>(addDemoHolding(body), { status: 201 })
    } catch (error) {
      if (error instanceof DemoApiError) {
        return new HttpResponse(error.message, { status: error.status })
      }
      return new HttpResponse('The holding could not be added.', { status: 400 })
    }
  }),

  http.get('*/api/stocks', async () => {
    await delay()
    return HttpResponse.json<Stock[]>(demoStocks)
  }),
]
