import Box from '@mui/material/Box'
import type { GridColDef } from '@mui/x-data-grid'
import { MARKETS } from '@/features/stocks/markets'
import { DataTable } from '@/shared/components/DataTable'
import { SignedValue } from '@/shared/components/SignedValue'
import { TwoLineCell } from '@/shared/components/TwoLineCell'
import {
  formatCurrency,
  formatPercent,
  formatPrice,
  formatQuantity,
  type CurrencyCode,
} from '@/shared/formatting/format'
import type { HoldingRow } from './calculations'

type Column = GridColDef<HoldingRow>

function columns(baseCurrency: CurrencyCode): Column[] {
  const base = (value: number | null, signed = false) =>
    formatCurrency(value, { currency: baseCurrency, signed })

  return [
    {
      field: 'symbol',
      headerName: 'Stock',
      flex: 1,
      minWidth: 180,
      valueGetter: (_value, row) => row.stock.symbol,
      renderCell: ({ row }) => (
        <TwoLineCell
          primary={row.stock.symbol}
          secondary={`${row.stock.name} · ${MARKETS[row.stock.market].label}`}
        />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      type: 'number',
      width: 120,
      valueGetter: (_value, row) => row.quote.price,
      renderCell: ({ row }) => formatPrice(row.quote.price, row.stock.currency),
    },
    {
      field: 'dayChange',
      headerName: 'Day change',
      type: 'number',
      width: 110,
      valueGetter: (_value, row) => row.quote.changePercent,
      renderCell: ({ value }) => <SignedValue value={value ?? null} format={formatPercent} />,
    },
    {
      field: 'quantity',
      headerName: 'Qty',
      type: 'number',
      width: 90,
      renderCell: ({ row }) => formatQuantity(row.quantity),
    },
    {
      field: 'averageCost',
      headerName: 'Avg cost',
      type: 'number',
      width: 120,
      renderCell: ({ row }) => formatPrice(row.averageCost, row.stock.currency),
    },
    {
      field: 'marketValueBase',
      headerName: `Value (${baseCurrency})`,
      type: 'number',
      width: 120,
      renderCell: ({ row }) => base(row.marketValueBase),
    },
    {
      field: 'unrealisedPnlBase',
      headerName: `P/L (${baseCurrency})`,
      type: 'number',
      width: 120,
      renderCell: ({ row }) => (
        <SignedValue value={row.unrealisedPnlBase} format={(v) => base(v, true)} />
      ),
    },
    {
      field: 'unrealisedPnlPercent',
      headerName: 'Return',
      type: 'number',
      width: 100,
      renderCell: ({ row }) => (
        <SignedValue value={row.unrealisedPnlPercent} format={formatPercent} />
      ),
    },
    {
      field: 'weightPercent',
      headerName: 'Weight',
      type: 'number',
      width: 90,
      renderCell: ({ row }) => formatPercent(row.weightPercent, { signed: false, decimals: 1 }),
    },
    {
      field: 'sector',
      headerName: 'Sector',
      width: 170,
      valueGetter: (_value, row) => row.stock.sector,
      renderCell: ({ value }) => (
        <Box component="span" sx={{ color: 'text.secondary' }}>
          {value}
        </Box>
      ),
    },
  ]
}

interface HoldingsTableProps {
  rows: HoldingRow[]
  baseCurrency: CurrencyCode
  loading: boolean
}

/** Open holdings, largest first. Sorts by any column; pages once there are more than 25. */
export function HoldingsTable({ rows, baseCurrency, loading }: HoldingsTableProps) {
  return (
    <DataTable
      rows={rows}
      columns={columns(baseCurrency)}
      getRowId={(row) => row.rowKey}
      loading={loading}
      aria-label="Holdings"
      initialState={{ sorting: { sortModel: [{ field: 'marketValueBase', sort: 'desc' }] } }}
    />
  )
}
