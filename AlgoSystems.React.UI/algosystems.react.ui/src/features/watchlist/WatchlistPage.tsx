import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { stockColumns } from '@/features/stocks/columns'
import type { StockRow } from '@/features/stocks/model'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import { DataTable } from '@/shared/components/DataTable'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { useConfirmTarget } from '@/shared/hooks/useConfirmTarget'
import { useRemoveFromWatchlist, useWatchlist } from './api'

export default function WatchlistPage() {
  const watchlist = useWatchlist()
  const remove = useRemoveFromWatchlist()
  const confirm = useConfirmTarget<StockRow>()

  const columns: GridColDef<StockRow>[] = [
    stockColumns.symbol,
    stockColumns.sector,
    stockColumns.close,
    stockColumns.changePercent,
    stockColumns.marketCap,
    { ...stockColumns.openPrice, headerName: 'Trigger' },
    stockColumns.stopLoss,
    stockColumns.atr,
    { ...stockColumns.volume, headerName: 'Size', description: 'Suggested position size' },
    {
      field: 'actions',
      type: 'actions',
      width: 56,
      getActions: ({ row }) => [
        <GridActionsCellItem
          key="remove"
          icon={<DeleteOutlineIcon fontSize="small" />}
          label={`Remove ${row.symbol}`}
          onClick={() => confirm.request(row)}
        />,
      ],
    },
  ]

  return (
    <>
      <PageHeader title="Watchlist" description="Stocks flagged by today's scans for follow-up." />

      {watchlist.isError ? (
        <ErrorState error={watchlist.error} onRetry={() => watchlist.refetch()} />
      ) : (
        <DataTable
          rows={watchlist.data ?? []}
          columns={columns}
          getRowId={(row) => row.rowKey}
          loading={watchlist.isPending}
          rowHeight={48}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Remove from watchlist"
        message={`Remove ${confirm.target?.symbol} from the watchlist?`}
        confirmLabel="Remove"
        pending={remove.isPending}
        onClose={confirm.close}
        onConfirm={() =>
          confirm.target && remove.mutate(confirm.target.id, { onSettled: confirm.close })
        }
      />
    </>
  )
}
