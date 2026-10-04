import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { LineChart } from '@mui/x-charts/LineChart'
import { useMemo } from 'react'
import { formatCurrency, formatDate } from '@/shared/formatting/format'
import type { StockRow } from './model'
import { equityCurve } from './positions'

interface EquityCurveProps {
  closedPositions: StockRow[] | undefined
  height?: number
}

/** Cumulative realised P/L over time, coloured by whether the strategy is net up or down. */
export function EquityCurve({ closedPositions, height = 260 }: EquityCurveProps) {
  const theme = useTheme()
  const points = useMemo(() => equityCurve(closedPositions ?? []), [closedPositions])

  if (!closedPositions) return <Skeleton variant="rectangular" height={height} />

  if (points.length < 2) {
    return (
      <Box sx={{ height, display: 'grid', placeItems: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Not enough closed trades to chart yet.
        </Typography>
      </Box>
    )
  }

  const final = points[points.length - 1].cumulative
  const color = final >= 0 ? theme.palette.market.up : theme.palette.market.down

  return (
    <LineChart
      height={height}
      hideLegend
      grid={{ horizontal: true }}
      margin={{ left: 8, right: 16, top: 16, bottom: 8 }}
      xAxis={[
        {
          data: points.map((p) => p.date),
          scaleType: 'time',
          valueFormatter: (value: Date) => formatDate(value),
        },
      ]}
      yAxis={[
        {
          width: 72,
          valueFormatter: (value: number) => formatCurrency(value),
        },
      ]}
      series={[
        {
          data: points.map((p) => p.cumulative),
          label: 'Cumulative P/L',
          color,
          area: true,
          showMark: false,
          curve: 'linear',
          valueFormatter: (value) => formatCurrency(value, { signed: true }),
        },
      ]}
      sx={{
        '& .MuiAreaElement-root': { fillOpacity: 0.12 },
        '& .MuiChartsGrid-line': { stroke: theme.palette.divider, strokeDasharray: '2 4' },
        '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: theme.palette.divider },
      }}
    />
  )
}
