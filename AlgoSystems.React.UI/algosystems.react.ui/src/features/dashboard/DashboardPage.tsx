import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import { useQueries } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router'
import { portfolioStatisticsQuery } from '@/features/portfolio/api'
import { useScanCounters } from '@/features/screener/api'
import { getScan, scanLabel, STRATEGY_SCANS } from '@/features/stocks/scans'
import { useWatchlist } from '@/features/watchlist/api'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { ResponsiveGrid } from '@/shared/components/ResponsiveGrid'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatTile } from '@/shared/components/StatTile'
import { formatCurrency, formatInteger } from '@/shared/formatting/format'

const signedCurrency = (value: number | null) => formatCurrency(value, { signed: true })

export default function DashboardPage() {
  const counters = useScanCounters()
  const watchlist = useWatchlist()
  const strategies = useQueries({
    queries: STRATEGY_SCANS.map((scan) => portfolioStatisticsQuery(scan)),
  })

  const totalSignals = counters.data?.reduce((total, c) => total + c.count, 0) ?? null
  const strategiesLoaded = strategies.every((q) => q.data)
  const totalRealised = strategiesLoaded
    ? strategies.reduce((total, q) => total + q.data!.realisedNet, 0)
    : null
  const totalUnrealised = strategiesLoaded
    ? strategies.reduce((total, q) => total + q.data!.unrealisedNet, 0)
    : null
  const strategyError = strategies.find((q) => q.isError)

  return (
    <>
      <PageHeader title="Dashboard" description="Today's signals and strategy performance." />

      <Stack spacing={3}>
        <ResponsiveGrid minItemWidth={180}>
          <StatTile
            label="Scan signals"
            loading={counters.isPending}
            value={formatInteger(totalSignals)}
          />
          <StatTile
            label="Watchlist"
            loading={watchlist.isPending}
            value={formatInteger(watchlist.data?.length ?? null)}
          />
          <StatTile
            label="Strategy realised P/L"
            loading={!strategiesLoaded && !strategyError}
            value={<SignedValue value={totalRealised} format={signedCurrency} />}
          />
          <StatTile
            label="Strategy unrealised P/L"
            loading={!strategiesLoaded && !strategyError}
            value={<SignedValue value={totalUnrealised} format={signedCurrency} />}
          />
        </ResponsiveGrid>

        <Panel title="Today's scans">
          {counters.isError ? (
            <ErrorState error={counters.error} onRetry={() => counters.refetch()} />
          ) : counters.isPending ? (
            <ResponsiveGrid minItemWidth={220}>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} variant="rectangular" height={64} />
              ))}
            </ResponsiveGrid>
          ) : counters.data.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No scan results yet. They appear after the nightly scan batch has run.
            </Typography>
          ) : (
            <ResponsiveGrid minItemWidth={220}>
              {counters.data.map((scan) => {
                const definition = getScan(scan.scanType)
                return (
                  <Paper
                    key={scan.scanType}
                    variant="outlined"
                    component={RouterLink}
                    to={`/screener?scan=${encodeURIComponent(scan.scanType)}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      px: 2,
                      py: 1.5,
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'border-color 120ms',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {scan.label}
                      </Typography>
                      {definition && (
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {definition.market} · {definition.direction}
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                      {scan.count}
                    </Typography>
                    <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </Paper>
                )
              })}
            </ResponsiveGrid>
          )}
        </Panel>

        <Panel title="Strategy portfolios">
          {strategyError ? (
            <ErrorState error={strategyError.error} onRetry={() => strategyError.refetch()} />
          ) : (
            <Box sx={{ overflowX: 'auto', mx: -2, my: -2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Strategy</TableCell>
                    <TableCell align="right">Realised P/L</TableCell>
                    <TableCell align="right">Unrealised P/L</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {STRATEGY_SCANS.map((scan, i) => {
                    const stats = strategies[i].data
                    return (
                      <TableRow key={scan} hover>
                        <TableCell>
                          <ButtonBase
                            component={RouterLink}
                            to={`/portfolio?strategy=${encodeURIComponent(scan)}`}
                            sx={{ fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                          >
                            {scanLabel(scan)}
                          </ButtonBase>
                        </TableCell>
                        {stats ? (
                          <>
                            <TableCell align="right">
                              <SignedValue value={stats.realisedNet} format={signedCurrency} />
                            </TableCell>
                            <TableCell align="right">
                              <SignedValue value={stats.unrealisedNet} format={signedCurrency} />
                            </TableCell>
                            <TableCell align="right">
                              <SignedValue
                                value={stats.realisedNet + stats.unrealisedNet}
                                format={signedCurrency}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </>
                        ) : (
                          <TableCell colSpan={3}>
                            <Skeleton />
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </Panel>
      </Stack>
    </>
  )
}
