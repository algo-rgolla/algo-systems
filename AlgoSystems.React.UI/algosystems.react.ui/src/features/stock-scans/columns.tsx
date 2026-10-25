import SouthEastIcon from '@mui/icons-material/SouthEast'
import NorthEastIcon from '@mui/icons-material/NorthEast'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import type { GridColDef } from '@mui/x-data-grid'
import { MARKETS } from '@/features/stocks/markets'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatusPill } from '@/shared/components/StatusPill'
import { TwoLineCell } from '@/shared/components/TwoLineCell'
import {
  formatChange,
  formatCompact,
  formatDate,
  formatMultiple,
  formatPercent,
  formatPrice,
} from '@/shared/formatting/format'
import { crossoverDirection } from './filters'
import type { ScanMetrics, ScanResult, ScanType } from './types'

type Column = GridColDef<ScanResult>
type EmaMetrics = Extract<ScanMetrics, { scanType: 'ema-crossover' }>
type VolumeMetrics = Extract<ScanMetrics, { scanType: 'unusual-volume' | 'big-gainers' }>

const emaOf = (row: ScanResult): EmaMetrics | null =>
  row.metrics.scanType === 'ema-crossover' ? row.metrics : null

const volumeOf = (row: ScanResult): VolumeMetrics | null =>
  row.metrics.scanType === 'ema-crossover' ? null : row.metrics

const stock: Column = {
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
}

const price: Column = {
  field: 'price',
  headerName: 'Price',
  type: 'number',
  width: 115,
  valueGetter: (_value, row) => row.quote.price,
  renderCell: ({ row }) => formatPrice(row.quote.price, row.stock.currency),
}

const dayChangePercent = (headerName = 'Day change'): Column => ({
  field: 'changePercent',
  headerName,
  type: 'number',
  width: 105,
  valueGetter: (_value, row) => row.quote.changePercent,
  renderCell: ({ row }) => <SignedValue value={row.quote.changePercent} format={formatPercent} />,
})

const dayChangeAmount: Column = {
  field: 'change',
  headerName: 'Day change',
  description: 'Price change from the previous close',
  type: 'number',
  width: 105,
  valueGetter: (_value, row) => row.quote.change,
  renderCell: ({ row }) => <SignedValue value={row.quote.change} format={(v) => formatChange(v)} />,
}

const volume: Column = {
  field: 'volume',
  headerName: 'Volume',
  type: 'number',
  width: 100,
  valueGetter: (_value, row) => row.quote.volume,
  renderCell: ({ row }) => formatCompact(row.quote.volume),
}

const averageVolume: Column = {
  field: 'averageVolume',
  headerName: 'Avg volume',
  description: 'Average of the previous 20 sessions',
  type: 'number',
  width: 105,
  valueGetter: (_value, row) => row.quote.averageVolume,
  renderCell: ({ row }) => formatCompact(row.quote.averageVolume),
}

const relativeVolume: Column = {
  field: 'relativeVolume',
  headerName: 'Rel. volume',
  description: 'Volume ÷ 20-session average volume',
  type: 'number',
  width: 105,
  valueGetter: (_value, row) => volumeOf(row)?.relativeVolume ?? null,
  renderCell: ({ value }) => (
    <Box component="span" sx={{ fontWeight: 700 }}>
      {formatMultiple(value ?? null)}
    </Box>
  ),
}

const sector: Column = {
  field: 'sector',
  headerName: 'Sector',
  minWidth: 140,
  flex: 0.6,
  valueGetter: (_value, row) => row.stock.sector,
  renderCell: ({ value }) => (
    <Box component="span" sx={{ color: 'text.secondary' }}>
      {value}
    </Box>
  ),
}

const score: Column = {
  field: 'score',
  headerName: 'Score',
  description: 'The scan’s match score, out of 10 (simulated)',
  type: 'number',
  width: 95,
  renderCell: ({ row }) => (
    <Box component="span">
      <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>
        {row.score.toFixed(1)}
      </Box>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        /10
      </Box>
    </Box>
  ),
}

const signal: Column = {
  field: 'signal',
  headerName: 'Signal',
  width: 150,
  valueGetter: (_value, row) => row.signal.label,
  renderCell: ({ row }) => (
    <StatusPill tone={row.signal.strength === 'strong' ? 'positive' : 'warn'}>
      {row.signal.label}
    </StatusPill>
  ),
}

const emaColumn = (period: 9 | 21, headerName: string): Column => ({
  field: `ema${period}`,
  headerName,
  type: 'number',
  width: 120,
  valueGetter: (_value, row) => {
    const ema = emaOf(row)
    return ema ? (period === 9 ? ema.ema9 : ema.ema21) : null
  },
  renderCell: ({ row, value }) => formatPrice(value ?? null, row.stock.currency),
})

const direction: Column = {
  field: 'direction',
  headerName: 'Crossover',
  description: 'Short EMA relative to the long EMA',
  width: 120,
  valueGetter: (_value, row) => {
    const ema = emaOf(row)
    return ema ? crossoverDirection(ema) : null
  },
  renderCell: ({ value }) => {
    const bullish = value === 'bullish'
    const Icon = bullish ? NorthEastIcon : SouthEastIcon
    return (
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          fontWeight: 600,
          color: bullish ? 'market.up' : 'market.down',
        }}
      >
        <Icon aria-hidden sx={{ fontSize: 14 }} />
        {bullish ? 'Bullish' : 'Bearish'}
      </Box>
    )
  },
}

const crossedOn: Column = {
  field: 'crossedOn',
  headerName: 'Crossed on',
  description: 'Session on which EMA 9 closed above EMA 21',
  width: 125,
  valueGetter: (_value, row) => emaOf(row)?.crossedOn ?? '',
  renderCell: ({ row }) => {
    const ema = emaOf(row)
    if (!ema?.crossedOn) {
      return (
        <Tooltip title="EMA 9 has been above EMA 21 for the whole available price history.">
          <Box component="span" sx={{ color: 'text.secondary' }}>
            Established
          </Box>
        </Tooltip>
      )
    }
    return formatDate(ema.crossedOn)
  },
}

/** Each scan's results table, as described in the scan specification. */
export const SCAN_COLUMNS: Record<ScanType, Column[]> = {
  'big-gainers': [
    stock,
    price,
    dayChangeAmount,
    dayChangePercent('Gain'),
    volume,
    sector,
    score,
    signal,
  ],
  'unusual-volume': [
    stock,
    price,
    dayChangePercent(),
    sector,
    volume,
    averageVolume,
    relativeVolume,
    score,
    signal,
  ],
  'ema-crossover': [
    stock,
    price,
    dayChangePercent(),
    emaColumn(9, 'EMA 9 (short)'),
    emaColumn(21, 'EMA 21 (long)'),
    direction,
    crossedOn,
    score,
    signal,
  ],
}
