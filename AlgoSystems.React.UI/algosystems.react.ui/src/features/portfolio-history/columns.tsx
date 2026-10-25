import type { GridColDef } from '@mui/x-data-grid'
import { MARKETS } from '@/features/stocks/markets'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatusPill, type StatusTone } from '@/shared/components/StatusPill'
import { TwoLineCell } from '@/shared/components/TwoLineCell'
import {
  formatCurrency,
  formatDate,
  formatPercent,
  formatPrice,
  formatQuantity,
} from '@/shared/formatting/format'
import { OUTCOME_LABELS } from './model'
import type { ClosedTrade, TradeOutcome } from './types'

type Column = GridColDef<ClosedTrade>

const OUTCOME_TONES: Record<TradeOutcome, StatusTone> = {
  win: 'positive',
  loss: 'negative',
  breakeven: 'neutral',
}

// ISO dates sort correctly as strings, so the date columns sort on the raw value.
const dateColumn = (field: 'entryDate' | 'exitDate', headerName: string): Column => ({
  field,
  headerName,
  width: 115,
  renderCell: ({ row }) => formatDate(row[field]),
})

const priceColumn = (field: 'entryPrice' | 'exitPrice', headerName: string): Column => ({
  field,
  headerName,
  type: 'number',
  width: 115,
  renderCell: ({ row }) => formatPrice(row[field], row.stock.currency),
})

/** The reference's closed-trades table. Prices and P/L are in each stock's own currency. */
export const CLOSED_TRADE_COLUMNS: Column[] = [
  {
    field: 'symbol',
    headerName: 'Stock',
    flex: 1,
    minWidth: 170,
    valueGetter: (_value, row) => row.stock.symbol,
    renderCell: ({ row }) => (
      <TwoLineCell
        primary={row.stock.symbol}
        secondary={`${row.stock.name} · ${MARKETS[row.stock.market].label}`}
      />
    ),
  },
  {
    field: 'side',
    headerName: 'Side',
    width: 80,
    renderCell: ({ row }) => (
      <StatusPill tone="neutral">{row.side === 'long' ? 'Long' : 'Short'}</StatusPill>
    ),
  },
  dateColumn('entryDate', 'Entry date'),
  dateColumn('exitDate', 'Exit date'),
  {
    field: 'quantity',
    headerName: 'Qty',
    type: 'number',
    width: 80,
    renderCell: ({ row }) => formatQuantity(row.quantity),
  },
  priceColumn('entryPrice', 'Entry price'),
  priceColumn('exitPrice', 'Exit price'),
  {
    field: 'realisedPnl',
    headerName: 'Realised P/L',
    description: 'Profit or loss locked in when the trade closed, in the stock’s currency',
    type: 'number',
    width: 130,
    renderCell: ({ row }) => (
      <SignedValue
        value={row.realisedPnl}
        format={(v) =>
          formatCurrency(v, { currency: row.stock.currency, decimals: 2, signed: true })
        }
      />
    ),
  },
  {
    field: 'returnPercent',
    headerName: 'Return',
    description: 'Realised P/L ÷ entry cost',
    type: 'number',
    width: 95,
    renderCell: ({ row }) => <SignedValue value={row.returnPercent} format={formatPercent} />,
  },
  {
    field: 'outcome',
    headerName: 'Outcome',
    width: 105,
    renderCell: ({ row }) => (
      <StatusPill tone={OUTCOME_TONES[row.outcome]}>{OUTCOME_LABELS[row.outcome]}</StatusPill>
    ),
  },
]
