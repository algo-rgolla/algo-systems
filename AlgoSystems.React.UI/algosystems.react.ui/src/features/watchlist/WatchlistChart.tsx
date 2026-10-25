import Box from '@mui/material/Box'
import { useMemo } from 'react'
import { usePriceHistory } from '@/features/stocks/api'
import type { Stock } from '@/features/stocks/types'
import { CandlestickChart } from '@/shared/components/CandlestickChart'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { formatPrice } from '@/shared/formatting/format'

/** Sessions shown on each card: about four months, as in the design. */
export const WATCHLIST_CHART_SESSIONS = 90

const CHART_HEIGHT = { xs: 220, md: 280 }

/** A watchlist card's daily candlestick chart over the stock's (simulated) price history. */
export function WatchlistChart({ stock }: { stock: Stock }) {
  const history = usePriceHistory(stock.key)
  const candles = useMemo(
    () => history.data?.bars.slice(-WATCHLIST_CHART_SESSIONS) ?? [],
    [history.data],
  )
  const formatValue = useMemo(
    () => (value: number) => formatPrice(value, stock.currency),
    [stock.currency],
  )

  return (
    <Box sx={{ mt: '14px', mb: '4px' }}>
      {history.isError ? (
        <Box sx={{ height: CHART_HEIGHT, display: 'grid', alignContent: 'center' }}>
          <ErrorState
            title="The chart could not be loaded"
            error={history.error}
            onRetry={() => history.refetch()}
          />
        </Box>
      ) : history.isPending ? (
        <Box sx={{ height: CHART_HEIGHT, display: 'grid' }}>
          <LoadingState label={`Loading the ${stock.symbol} chart`} minHeight={0} />
        </Box>
      ) : (
        <CandlestickChart
          candles={candles}
          height={CHART_HEIGHT}
          formatValue={formatValue}
          label={`${stock.symbol} daily candlestick chart, last ${candles.length} sessions of simulated prices`}
        />
      )}
    </Box>
  )
}
