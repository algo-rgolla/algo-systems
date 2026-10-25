import Box from '@mui/material/Box'
import type { Breakpoint } from '@mui/material/styles'
import { useTheme } from '@mui/material/styles'
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight'
import { ChartsDataProvider } from '@mui/x-charts/ChartsDataProvider'
import { ChartsGrid, chartsGridClasses } from '@mui/x-charts/ChartsGrid'
import { ChartsSurface } from '@mui/x-charts/ChartsSurface'
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip'
import { ChartsWrapper } from '@mui/x-charts/ChartsWrapper'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { useXScale, useYScale } from '@mui/x-charts/hooks'
import type { LineSeriesType } from '@mui/x-charts/models'
import { useMemo } from 'react'
import { isoDateToUtc, type IsoDate } from '@/shared/formatting/dates'
import { formatDate, formatPrice } from '@/shared/formatting/format'

/** One daily candle. */
export interface Candle {
  date: IsoDate
  open: number
  high: number
  low: number
  close: number
}

interface CandlestickChartProps {
  candles: readonly Candle[]
  /** Describes the chart to screen readers, e.g. "NVDA daily candlestick chart". */
  label: string
  /** Responsive height; the width always fills the container. */
  height: number | Partial<Record<Breakpoint, number>>
  /** Prices on the axis and in the tooltip. */
  formatValue?: (value: number) => string
}

const FIELDS = ['open', 'high', 'low', 'close'] as const
const FIELD_LABELS = { open: 'Open', high: 'High', low: 'Low', close: 'Close' }

const monthFormatter = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'UTC' })

/** Draws the candles in the chart's band (x) and linear (y) scales. */
function CandlestickPlot({
  candles,
  up,
  down,
}: {
  candles: readonly Candle[]
  up: string
  down: string
}) {
  const x = useXScale<'band'>()
  const y = useYScale<'linear'>()
  const width = Math.max(1, x.bandwidth())

  return (
    <g>
      {candles.map((candle) => {
        const left = x(candle.date)
        if (left == null) return null
        const center = left + width / 2
        const color = candle.close >= candle.open ? up : down
        const top = y(Math.max(candle.open, candle.close))
        const bottom = y(Math.min(candle.open, candle.close))
        return (
          <g key={candle.date}>
            <line
              x1={center}
              x2={center}
              y1={y(candle.high)}
              y2={y(candle.low)}
              stroke={color}
              strokeWidth={1}
            />
            <rect x={left} y={top} width={width} height={Math.max(1, bottom - top)} fill={color} />
          </g>
        )
      })}
    </g>
  )
}

/**
 * Daily candlesticks with a right-hand price axis and an OHLC tooltip, styled like the design's
 * watchlist charts. The chart measures its container and redraws when it resizes; MUI X Charts
 * owns the resize observer and releases it on unmount, so there is nothing to clean up here.
 * Scrolling and zooming are off, so the page scrolls normally over it.
 */
export function CandlestickChart({
  candles,
  label,
  height,
  formatValue = formatPrice,
}: CandlestickChartProps) {
  const theme = useTheme()
  const { up, down } = theme.palette.market

  const { dates, series, min, max } = useMemo(() => {
    const lows = candles.map((c) => c.low)
    const highs = candles.map((c) => c.high)
    const low = Math.min(...lows)
    const high = Math.max(...highs)
    const padding = (high - low) * 0.08 || high * 0.01
    // The OHLC series aren't drawn (CandlestickPlot draws the candles); they feed the tooltip.
    const series: LineSeriesType[] = FIELDS.map((field) => ({
      type: 'line',
      id: field,
      label: FIELD_LABELS[field],
      data: candles.map((c) => c[field]),
      color: theme.palette.text.secondary,
      valueFormatter: (value) => (value == null ? '' : formatValue(value)),
    }))
    return {
      dates: candles.map((c) => c.date),
      series,
      min: low - padding,
      max: high + padding,
    }
  }, [candles, formatValue, theme.palette.text.secondary])

  const tickLabelStyle = { fontSize: 10, fill: theme.palette.text.secondary }

  return (
    <Box
      role="img"
      aria-label={label}
      sx={{
        height,
        minWidth: 0,
        [`& .${chartsGridClasses.line}`]: { stroke: theme.palette.line.subtle },
      }}
    >
      <ChartsDataProvider
        series={series}
        xAxis={[
          {
            id: 'date',
            scaleType: 'band',
            data: dates,
            categoryGapRatio: 0.35,
            height: 22,
            // A tick at the first session of each month.
            tickInterval: (_value: IsoDate, index: number) =>
              index > 0 && dates[index].slice(5, 7) !== dates[index - 1].slice(5, 7),
            valueFormatter: (value: IsoDate, context) =>
              context.location === 'tick'
                ? monthFormatter.format(isoDateToUtc(value))
                : formatDate(value),
          },
        ]}
        yAxis={[
          {
            id: 'price',
            scaleType: 'linear',
            position: 'right',
            min,
            max,
            width: 52,
            tickNumber: 5,
            valueFormatter: (value: number) => formatValue(value),
          },
        ]}
        margin={{ top: 8, right: 0, bottom: 0, left: 4 }}
      >
        <ChartsWrapper>
          <ChartsSurface>
            <ChartsGrid horizontal />
            <ChartsAxisHighlight x="band" />
            <CandlestickPlot candles={candles} up={up} down={down} />
            <ChartsXAxis disableLine disableTicks tickLabelStyle={tickLabelStyle} />
            <ChartsYAxis disableLine disableTicks tickLabelStyle={tickLabelStyle} />
          </ChartsSurface>
          <ChartsTooltip trigger="axis" />
        </ChartsWrapper>
      </ChartsDataProvider>
    </Box>
  )
}
