import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { useMemo, useState } from 'react'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { Panel } from '@/shared/components/Panel'
import { StatusPill } from '@/shared/components/StatusPill'
import { TradingViewWidget, type WidgetStatus } from '@/shared/components/TradingViewWidget'
import { formatDate } from '@/shared/formatting/format'
import { useMarketOverview } from './api'
import { MARKET_QUOTES_HEIGHT, MARKET_QUOTES_SCRIPT, marketQuotesConfig } from './marketData'
import { MarketQuotesBoard } from './MarketQuotesBoard'

/** Shown when the TradingView widget can't load: the API's (or demo) quotes, clearly labelled. */
function MarketDataFallback({ onRetryWidget }: { onRetryWidget: () => void }) {
  const overview = useMarketOverview()

  const retryWidget = (
    <Button variant="outlined" onClick={onRetryWidget}>
      Try live widget again
    </Button>
  )

  if (overview.isPending) return <LoadingState label="Loading market data" />
  if (overview.isError) {
    return (
      <Stack sx={{ gap: '12px' }}>
        <ErrorState
          title="Market data is unavailable"
          error={overview.error}
          onRetry={() => overview.refetch()}
        />
        <Box>{retryWidget}</Box>
      </Stack>
    )
  }

  return (
    <Stack sx={{ gap: '12px' }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{ gap: '10px', alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }} role="status">
          The live TradingView widget couldn’t load.{' '}
          {overview.data.simulated
            ? `Showing simulated demo prices as of ${formatDate(overview.data.asOf)}, not live market data.`
            : `Showing prices as of ${formatDate(overview.data.asOf)}.`}
        </Typography>
        {retryWidget}
      </Stack>
      <MarketQuotesBoard quotes={overview.data.quotes} />
    </Stack>
  )
}

/** The reference's "Market data" panel: TradingView's market quotes widget, with a fallback. */
export function MarketDataPanel() {
  const theme = useTheme()
  const [attempt, setAttempt] = useState(0)
  // Offline, the widget can't load, so go straight to the fallback.
  const [status, setStatus] = useState<WidgetStatus>(() =>
    navigator.onLine ? 'loading' : 'unavailable',
  )
  const config = useMemo(
    () => marketQuotesConfig(theme.palette.background.paper),
    [theme.palette.background.paper],
  )

  const unavailable = status === 'unavailable'

  return (
    <Panel
      title="Market data"
      actions={unavailable ? <StatusPill tone="warn">Simulated</StatusPill> : undefined}
    >
      {unavailable ? (
        <MarketDataFallback
          onRetryWidget={() => {
            setStatus('loading')
            setAttempt((n) => n + 1)
          }}
        />
      ) : (
        <>
          <Box sx={{ borderRadius: '9px', overflow: 'hidden' }}>
            <TradingViewWidget
              key={attempt}
              scriptSrc={MARKET_QUOTES_SCRIPT}
              config={config}
              height={MARKET_QUOTES_HEIGHT}
              label="Loading market data"
              onStatusChange={setStatus}
            />
          </Box>
          {/* TradingView's attribution, required by its widget terms. */}
          <Box sx={{ textAlign: 'center', fontSize: '0.6875rem', lineHeight: '32px' }}>
            <Link
              href="https://www.tradingview.com/"
              target="_blank"
              rel="noopener nofollow"
              underline="hover"
              sx={{ color: 'text.secondary' }}
            >
              Market data by TradingView
            </Link>
          </Box>
        </>
      )}
    </Panel>
  )
}
