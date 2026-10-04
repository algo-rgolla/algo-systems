import type { ComponentType } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { NotFoundPage, RouteErrorPage } from './RouteFallbacks'

// Each page is code-split; the grid and chart libraries load only where used.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: page(() => import('@/features/dashboard/DashboardPage')) },
      { path: 'screener', lazy: page(() => import('@/features/screener/ScreenerPage')) },
      { path: 'watchlist', lazy: page(() => import('@/features/watchlist/WatchlistPage')) },
      { path: 'portfolio', lazy: page(() => import('@/features/portfolio/PortfolioPage')) },
      { path: 'trades', lazy: page(() => import('@/features/trades/TradesPage')) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
