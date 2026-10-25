import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { ReactNode } from 'react'
import { theme } from '@/app/theme/theme'
import { NotificationHost } from '@/shared/notifications/NotificationHost'
import { queryClient } from './queryClient'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
        <NotificationHost />
      </ThemeProvider>
      {/* Top right keeps the toggle clear of the sidebar footer and the phone bottom navigation. */}
      {import.meta.env.DEV && <ReactQueryDevtools buttonPosition="top-right" />}
    </QueryClientProvider>
  )
}
