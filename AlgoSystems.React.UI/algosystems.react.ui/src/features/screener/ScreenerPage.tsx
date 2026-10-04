import Alert from '@mui/material/Alert'
import type { GridColDef } from '@mui/x-data-grid'
import { useSearchParams } from 'react-router'
import { stockColumns } from '@/features/stocks/columns'
import type { StockRow } from '@/features/stocks/model'
import { DataTable } from '@/shared/components/DataTable'
import { ErrorState } from '@/shared/components/ErrorState'
import { PageHeader } from '@/shared/components/PageHeader'
import { useScanCounters, useScanResults } from './api'
import { ScanTabs } from './ScanTabs'

const columns: GridColDef<StockRow>[] = [
  stockColumns.symbol,
  stockColumns.sector,
  stockColumns.close,
  stockColumns.changePercent,
  stockColumns.marketCap,
  stockColumns.stopLoss,
  stockColumns.atr,
  { ...stockColumns.volume, headerName: 'Size', description: 'Suggested position size' },
]

export default function ScreenerPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const counters = useScanCounters()

  // The selected scan lives in the URL so results are linkable and survive reloads.
  const selectedScan = searchParams.get('scan') ?? counters.data?.[0]?.scanType ?? null
  const results = useScanResults(selectedScan)

  return (
    <>
      <PageHeader
        title="Screener"
        description="End-of-day scan results from the latest batch run."
      />

      {counters.isError ? (
        <ErrorState error={counters.error} onRetry={() => counters.refetch()} />
      ) : counters.data?.length === 0 ? (
        <Alert severity="info" variant="outlined">
          No scan results yet. They appear after the nightly scan batch has run.
        </Alert>
      ) : (
        <>
          <ScanTabs
            counters={counters.data}
            value={selectedScan}
            onChange={(next) => setSearchParams({ scan: next })}
          />
          {results.isError ? (
            <ErrorState error={results.error} onRetry={() => results.refetch()} />
          ) : (
            <DataTable
              rows={results.data ?? []}
              columns={columns}
              getRowId={(row) => row.rowKey}
              loading={results.isPending && Boolean(selectedScan)}
              rowHeight={48}
              initialState={{
                sorting: { sortModel: [{ field: 'changePercent', sort: 'desc' }] },
                pagination: { paginationModel: { pageSize: 50 } },
              }}
            />
          )}
        </>
      )}
    </>
  )
}
