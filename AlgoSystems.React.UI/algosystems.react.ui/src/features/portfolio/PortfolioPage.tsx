import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useSearchParams } from 'react-router'
import { stockColumns } from '@/features/stocks/columns'
import { EquityCurve } from '@/features/stocks/EquityCurve'
import type { StockRow } from '@/features/stocks/model'
import { summariseClosedPositions } from '@/features/stocks/positions'
import { scanLabel, STRATEGY_SCANS } from '@/features/stocks/scans'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTable } from '@/shared/components/DataTable'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { Panel } from '@/shared/components/Panel'
import { ResponsiveGrid } from '@/shared/components/ResponsiveGrid'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatTile } from '@/shared/components/StatTile'
import { formatCurrency, formatInteger } from '@/shared/formatting/format'
import { useConfirmTarget } from '@/shared/hooks/useConfirmTarget'
import {
  useClosedPositions,
  useDeleteClosedPosition,
  useOpenPositions,
  usePortfolioStatistics,
} from './api'

const openColumns: GridColDef<StockRow>[] = [
  stockColumns.symbol,
  stockColumns.openDate,
  stockColumns.volume,
  stockColumns.openPrice,
  stockColumns.close,
  stockColumns.stopLoss,
  stockColumns.tradeDays,
  stockColumns.profitLoss,
  stockColumns.returnPercent,
]

const signedCurrency = (value: number | null) => formatCurrency(value, { signed: true })

export default function PortfolioPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requested = searchParams.get('strategy')
  const strategy = requested && STRATEGY_SCANS.includes(requested) ? requested : STRATEGY_SCANS[0]

  const statistics = usePortfolioStatistics(strategy)
  const open = useOpenPositions(strategy)
  const closed = useClosedPositions(strategy)
  const deletePosition = useDeleteClosedPosition(strategy)
  const confirm = useConfirmTarget<StockRow>()

  const closedSummary = closed.data ? summariseClosedPositions(closed.data) : null

  const closedColumns: GridColDef<StockRow>[] = [
    stockColumns.symbol,
    stockColumns.openDate,
    stockColumns.closeDate,
    stockColumns.volume,
    stockColumns.openPrice,
    stockColumns.closePrice,
    stockColumns.profitLoss,
    stockColumns.returnPercent,
    stockColumns.sellReason,
    {
      field: 'actions',
      type: 'actions',
      width: 56,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon fontSize="small" />}
          label={`Delete ${row.symbol} trade`}
          onClick={() => confirm.request(row)}
        />,
      ],
    },
  ]

  return (
    <>
      <PageHeader
        title="Strategy portfolios"
        description="Simulated portfolios traded automatically from scan signals."
      />

      <Tabs
        value={strategy}
        onChange={(_, next: string) => setSearchParams({ strategy: next })}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {STRATEGY_SCANS.map((scan) => (
          <Tab key={scan} value={scan} label={scanLabel(scan)} />
        ))}
      </Tabs>

      <Stack spacing={3}>
        {statistics.isError && (
          <ErrorState error={statistics.error} onRetry={() => statistics.refetch()} />
        )}

        <ResponsiveGrid minItemWidth={180}>
          <StatTile
            label="Realised P/L"
            loading={statistics.isPending}
            value={
              <SignedValue value={statistics.data?.realisedNet ?? null} format={signedCurrency} />
            }
          />
          <StatTile
            label="Unrealised P/L"
            loading={statistics.isPending}
            value={
              <SignedValue value={statistics.data?.unrealisedNet ?? null} format={signedCurrency} />
            }
          />
          <StatTile
            label="Open positions"
            loading={open.isPending}
            value={formatInteger(open.data?.length ?? null)}
          />
          <StatTile
            label="Win rate"
            loading={closed.isPending}
            value={closedSummary?.winRate == null ? '—' : `${closedSummary.winRate.toFixed(1)}%`}
            hint={closedSummary && `${closedSummary.wins}W / ${closedSummary.losses}L`}
          />
        </ResponsiveGrid>

        <Panel title="Equity curve">
          {closed.isError ? (
            <ErrorState error={closed.error} onRetry={() => closed.refetch()} />
          ) : (
            <EquityCurve closedPositions={closed.data} />
          )}
        </Panel>

        <section>
          <Typography variant="h2" sx={{ mb: 1.5 }}>
            Open positions
          </Typography>
          {open.isError ? (
            <ErrorState error={open.error} onRetry={() => open.refetch()} />
          ) : (
            <DataTable
              rows={open.data ?? []}
              columns={openColumns}
              getRowId={(row) => row.rowKey}
              loading={open.isPending}
              rowHeight={48}
              height={440}
            />
          )}
        </section>

        <section>
          <Typography variant="h2" sx={{ mb: 1.5 }}>
            Closed positions
          </Typography>
          {closed.isError ? (
            <ErrorState error={closed.error} onRetry={() => closed.refetch()} />
          ) : (
            <DataTable
              rows={closed.data ?? []}
              columns={closedColumns}
              getRowId={(row) => row.rowKey}
              loading={closed.isPending}
              rowHeight={48}
              initialState={{
                sorting: { sortModel: [{ field: 'closeDate', sort: 'desc' }] },
                pagination: { paginationModel: { pageSize: 50 } },
              }}
            />
          )}
        </section>
      </Stack>

      <ConfirmDialog
        open={confirm.open}
        title="Delete closed position"
        message={`Permanently delete the closed ${confirm.target?.symbol} trade from this portfolio's history?`}
        pending={deletePosition.isPending}
        onClose={confirm.close}
        onConfirm={() =>
          confirm.target &&
          deletePosition.mutate(confirm.target.portfolioId, { onSettled: confirm.close })
        }
      />
    </>
  )
}
