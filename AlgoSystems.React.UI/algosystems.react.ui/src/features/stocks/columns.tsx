import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { GridColDef } from '@mui/x-data-grid'
import { SignedValue } from '@/shared/components/SignedValue'
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatInteger,
  formatPercent,
  formatPrice,
} from '@/shared/formatting/format'
import { positionReturnPercent, type StockRow } from './model'

type Column = GridColDef<StockRow>

function numberColumn(
  field: keyof StockRow & string,
  headerName: string,
  format: (value: number | null) => string,
  width = 100,
): Column {
  return {
    field,
    headerName,
    type: 'number',
    width,
    valueFormatter: (value: number | null) => format(value),
  }
}

/**
 * Column building blocks shared by every stock table. Features pick the
 * columns they need: `[stockColumns.symbol, stockColumns.close, ...]`.
 */
export const stockColumns = {
  symbol: {
    field: 'symbol',
    headerName: 'Symbol',
    minWidth: 200,
    flex: 1,
    renderCell: ({ row }) => (
      <Box
        sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.25 }}>
          {row.symbol}
        </Typography>
        {row.name && (
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', lineHeight: 1.25 }}>
            {row.name}
          </Typography>
        )}
      </Box>
    ),
  } satisfies Column,

  sector: {
    field: 'sector',
    headerName: 'Sector',
    width: 170,
    valueGetter: (_value, row) => row.sector ?? row.industry,
  } satisfies Column,

  close: numberColumn('close', 'Last', formatPrice, 90),
  openPrice: numberColumn('openPrice', 'Entry', formatPrice, 90),
  closePrice: numberColumn('closePrice', 'Exit', formatPrice, 90),
  stopLoss: numberColumn('stopLoss', 'Stop', formatPrice, 90),
  atr: numberColumn('atr', 'ATR', formatPrice, 80),
  volume: numberColumn('volume', 'Qty', formatInteger, 90),
  marketCap: numberColumn('marketCap', 'Mkt cap', formatCompact, 100),
  tradeDays: numberColumn('tradeDays', 'Days', formatInteger, 70),

  changePercent: {
    field: 'changePercent',
    headerName: 'Chg %',
    type: 'number',
    width: 90,
    renderCell: ({ value }) => <SignedValue value={value} format={formatPercent} />,
  } satisfies Column,

  profitLoss: {
    field: 'profitLoss',
    headerName: 'P/L',
    type: 'number',
    width: 110,
    renderCell: ({ value }) => (
      <SignedValue value={value} format={(v) => formatCurrency(v, { signed: true })} />
    ),
  } satisfies Column,

  returnPercent: {
    field: 'returnPercent',
    headerName: 'Return',
    type: 'number',
    width: 90,
    valueGetter: (_value, row) => positionReturnPercent(row),
    renderCell: ({ value }) => <SignedValue value={value} format={formatPercent} />,
  } satisfies Column,

  openDate: {
    field: 'openDate',
    headerName: 'Opened',
    type: 'date',
    width: 115,
    valueFormatter: (value: Date | null) => formatDate(value),
  } satisfies Column,

  closeDate: {
    field: 'closeDate',
    headerName: 'Closed',
    type: 'date',
    width: 115,
    valueFormatter: (value: Date | null) => formatDate(value),
  } satisfies Column,

  sellReason: {
    field: 'sellReason',
    headerName: 'Exit reason',
    minWidth: 160,
    flex: 1,
  } satisfies Column,

  action: {
    field: 'action',
    headerName: 'Side',
    width: 70,
  } satisfies Column,
}
