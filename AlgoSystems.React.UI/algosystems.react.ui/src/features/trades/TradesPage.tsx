import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import LogoutIcon from '@mui/icons-material/Logout'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { useState } from 'react'
import { stockColumns } from '@/features/stocks/columns'
import { EquityCurve } from '@/features/stocks/EquityCurve'
import type { StockRow } from '@/features/stocks/model'
import { summariseClosedPositions, totalProfitLoss } from '@/features/stocks/positions'
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
import { useClosedTrades, useDeleteTrade, useOpenTrades } from './api'
import { TradeDialog, type TradeDialogMode } from './TradeDialog'

const signedCurrency = (value: number | null) => formatCurrency(value, { signed: true })

export default function TradesPage() {
  const open = useOpenTrades()
  const closed = useClosedTrades()
  const deleteTrade = useDeleteTrade()
  const confirm = useConfirmTarget<StockRow>()
  const [dialog, setDialog] = useState<TradeDialogMode | null>(null)

  const closedSummary = closed.data ? summariseClosedPositions(closed.data) : null

  const openColumns: GridColDef<StockRow>[] = [
    stockColumns.symbol,
    stockColumns.openDate,
    stockColumns.volume,
    stockColumns.openPrice,
    stockColumns.close,
    stockColumns.tradeDays,
    stockColumns.profitLoss,
    stockColumns.returnPercent,
    {
      field: 'actions',
      type: 'actions',
      width: 88,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="close"
          icon={<LogoutIcon fontSize="small" />}
          label={`Close ${row.symbol}`}
          onClick={() => setDialog({ kind: 'close', trade: row })}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteOutlineIcon fontSize="small" />}
          label={`Delete ${row.symbol}`}
          onClick={() => confirm.request(row)}
        />,
      ],
    },
  ]

  const closedColumns: GridColDef<StockRow>[] = [
    stockColumns.symbol,
    stockColumns.openDate,
    stockColumns.closeDate,
    stockColumns.volume,
    stockColumns.openPrice,
    stockColumns.closePrice,
    stockColumns.profitLoss,
    stockColumns.returnPercent,
  ]

  return (
    <>
      <PageHeader
        title="Trades"
        description="Positions you have taken in the market, recorded manually."
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialog({ kind: 'open' })}
          >
            Record trade
          </Button>
        }
      />

      <Stack spacing={3}>
        <ResponsiveGrid minItemWidth={180}>
          <StatTile
            label="Unrealised P/L"
            loading={open.isPending}
            value={
              <SignedValue
                value={open.data ? totalProfitLoss(open.data) : null}
                format={signedCurrency}
              />
            }
          />
          <StatTile
            label="Realised P/L"
            loading={closed.isPending}
            value={
              <SignedValue value={closedSummary?.netProfitLoss ?? null} format={signedCurrency} />
            }
          />
          <StatTile
            label="Open positions"
            loading={open.isPending}
            value={formatInteger(open.data?.length ?? null)}
          />
          <StatTile
            label="Closed trades"
            loading={closed.isPending}
            value={formatInteger(closedSummary?.trades ?? null)}
            hint={closedSummary && `${closedSummary.wins}W / ${closedSummary.losses}L`}
          />
        </ResponsiveGrid>

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
              height={400}
            />
          )}
        </section>

        <Panel title="Equity curve">
          {closed.isError ? (
            <ErrorState error={closed.error} onRetry={() => closed.refetch()} />
          ) : (
            <EquityCurve closedPositions={closed.data} />
          )}
        </Panel>

        <section>
          <Typography variant="h2" sx={{ mb: 1.5 }}>
            Closed trades
          </Typography>
          {!closed.isError && (
            <DataTable
              rows={closed.data ?? []}
              columns={closedColumns}
              getRowId={(row) => row.rowKey}
              loading={closed.isPending}
              rowHeight={48}
              height={400}
              initialState={{
                sorting: { sortModel: [{ field: 'closeDate', sort: 'desc' }] },
                pagination: { paginationModel: { pageSize: 50 } },
              }}
            />
          )}
        </section>
      </Stack>

      <TradeDialog mode={dialog} onClose={() => setDialog(null)} />

      <ConfirmDialog
        open={confirm.open}
        title="Delete trade"
        message={`Delete the ${confirm.target?.symbol} trade? It will be archived and removed from your trades.`}
        pending={deleteTrade.isPending}
        onClose={confirm.close}
        onConfirm={() =>
          confirm.target &&
          deleteTrade.mutate(confirm.target.portfolioId, { onSettled: confirm.close })
        }
      />
    </>
  )
}
