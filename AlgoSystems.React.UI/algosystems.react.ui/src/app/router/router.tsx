import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/app/layout/AppLayout'
import { AppLoading, NotFoundPage, RouteErrorPage } from './RouteFallbacks'

// Each page is code-split; the grid and chart libraries load only where used.
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await load()).default,
})

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    hydrateFallbackElement: <AppLoading />,
    children: [
      { index: true, lazy: page(() => import('@/features/dashboard/DashboardPage')) },
      { path: 'portfolio', lazy: page(() => import('@/features/portfolio/PortfolioPage')) },
      {
        path: 'portfolio/history',
        lazy: page(() => import('@/features/portfolio-history/PortfolioHistoryPage')),
      },
      { path: 'scans', lazy: page(() => import('@/features/stock-scans/StockScansPage')) },
      { path: 'watchlist', lazy: page(() => import('@/features/watchlist/WatchlistPage')) },
      // A gallery of the shared visual components. Left out of production builds.
      ...(import.meta.env.DEV
        ? [{ path: 'dev/theme', lazy: page(() => import('@/dev/ThemePreviewPage')) }]
        : []),
      // Paths from the previous navigation.
      { path: 'screener', element: <Navigate to="/scans" replace /> },
      { path: 'trades', element: <Navigate to="/portfolio" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
