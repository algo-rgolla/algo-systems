import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { DataTable } from '@/shared/components/DataTable'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageContent, SplitLayout } from '@/shared/components/PageContent'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { StatCell, StatStrip } from '@/shared/components/StatStrip'
import { usePortfolioHistory } from './api'
import { summariseHistory } from './calculations'
import { CLOSED_TRADE_COLUMNS } from './columns'
import { DEFAULT_TRADE_FILTERS, filterClosedTrades, type ClosedTradeFilters } from './filters'
import { PerformanceSummaryPanel, TradeOutcomesPanel } from './HistorySummaryPanels'
import { netPnlView, profitFactorView, summaryScope, winRateView } from './model'
import { TradeFiltersBar } from './TradeFiltersBar'

const PAGE_SIZE = 10

export default function PortfolioHistoryPage() {
  const history = usePortfolioHistory()
  const [filters, setFilters] = useState<ClosedTradeFilters>(DEFAULT_TRADE_FILTERS)

  const all = useMemo(() => history.data?.trades ?? [], [history.data])
  const filtered = useMemo(() => filterClosedTrades(all, filters), [all, filters])
  // Every figure on the page describes the filtered trades, which are all trades by default.
  const summary = useMemo(
    () =>
      summariseHistory(
        filtered,
        history.data?.fxRates ?? { AUD: 1, USD: 1 },
        history.data?.baseCurrency ?? 'AUD',
      ),
    [filtered, history.data],
  )

  const loading = history.isPending
  const net = netPnlView(summary)
  const winRate = winRateView(summary)
  const profitFactor = profitFactorView(summary)
  const usdRate = history.data?.fxRates.USD

  const clearButton = (
    <Button variant="outlined" onClick={() => setFilters(DEFAULT_TRADE_FILTERS)}>
      Clear filters
    </Button>
  )

  if (history.isError) {
    return (
      <>
        <PageHeader title="Portfolio History" />
        <ErrorState error={history.error} onRetry={() => history.refetch()} />
      </>
    )
  }

  return (
    <>
      <PageHeader title="Portfolio History" />
      <PageContent>
        <Box>
          <Typography
            variant="caption"
            component="p"
            role="status"
            sx={{ color: 'text.secondary' }}
          >
            {loading ? (
              'Loading closed trades…'
            ) : (
              <>
                Summary of{' '}
                <Box component="strong" sx={{ color: 'text.primary', fontWeight: 700 }}>
                  {summaryScope(filtered.length, all.length).toLowerCase()}
                </Box>
                , realised in {summary.baseCurrency}
                {usdRate != null &&
                  ` (US trades at the demo rate of 1 USD = ${usdRate} ${summary.baseCurrency})`}
                .
              </>
            )}
          </Typography>
          <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: '4px' }}>
            Realised P/L is locked in by closed trades. Unrealised returns on open holdings are on
            the{' '}
            <Link component={RouterLink} to="/portfolio">
              Portfolio
            </Link>{' '}
            page.
          </Typography>
        </Box>

        <StatStrip>
          <StatCell
            label="Realised P/L"
            loading={loading}
            value={net.value}
            detail={net.detail}
            detailDirection={net.direction}
          />
          <StatCell
            label="Closed trades"
            loading={loading}
            value={String(summary.tradeCount)}
            detail={filtered.length === all.length ? 'Completed positions' : `of ${all.length}`}
          />
          <StatCell
            label="Win rate"
            loading={loading}
            value={winRate.value}
            detail={winRate.detail}
          />
          <StatCell
            label="Profit factor"
            loading={loading}
            value={profitFactor.value}
            detail={profitFactor.detail}
          />
        </StatStrip>

        <Panel title="Closed trades">
          <TradeFiltersBar filters={filters} onChange={setFilters} />
          {!loading && all.length === 0 ? (
            <EmptyState
              title="No closed trades yet"
              message="Trades appear here once a position is closed."
            />
          ) : !loading && filtered.length === 0 ? (
            <EmptyState
              title="No trades match these filters"
              message="Try a different search, outcome or date range. The summary shows no trades until the filters match some."
              action={clearButton}
            />
          ) : (
            <DataTable
              rows={filtered}
              columns={CLOSED_TRADE_COLUMNS}
              getRowId={(row) => row.id}
              loading={loading}
              aria-label="Closed trades"
              pageSizeOptions={[PAGE_SIZE, 25, 50]}
              initialState={{
                sorting: { sortModel: [{ field: 'exitDate', sort: 'desc' }] },
                pagination: { paginationModel: { pageSize: PAGE_SIZE } },
              }}
            />
          )}
        </Panel>

        {!loading && (
          <SplitLayout>
            <TradeOutcomesPanel summary={summary} />
            <PerformanceSummaryPanel summary={summary} />
          </SplitLayout>
        )}
      </PageContent>
    </>
  )
}
