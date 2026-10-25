import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { alpha, useTheme } from '@mui/material/styles'
import { chartsGridClasses } from '@mui/x-charts/ChartsGrid'
import { LineChart, lineClasses } from '@mui/x-charts/LineChart'
import { useId, useMemo, useState } from 'react'
import { EmptyState } from '@/shared/components/EmptyState'
import { ErrorState } from '@/shared/components/ErrorState'
import { LoadingState } from '@/shared/components/LoadingState'
import { Panel } from '@/shared/components/Panel'
import { SignedValue } from '@/shared/components/SignedValue'
import { isoDateToUtc, toIsoDate } from '@/shared/formatting/dates'
import { formatCurrency, formatDate, formatPercent } from '@/shared/formatting/format'
import { usePortfolioPerformance } from './api'
import { pointsInRange } from './calculations'
import { PERFORMANCE_RANGES, type PerformancePoint, type PerformanceRange } from './types'

const RANGE_LABELS: Record<PerformanceRange, string> = {
  '1M': '1 month',
  '3M': '3 months',
  '6M': '6 months',
  '1Y': '1 year',
}

const CHART_HEIGHT = { xs: 165, md: 205 }

function RangeMenu({
  value,
  onChange,
}: {
  value: PerformanceRange
  onChange: (range: PerformanceRange) => void
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const menuId = useId()

  return (
    <>
      <Button
        variant="text"
        size="small"
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
        aria-controls={anchor ? menuId : undefined}
        aria-label={`Performance range: ${RANGE_LABELS[value]}`}
        endIcon={<ArrowDropDownIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ minWidth: 0, p: '2px 4px', fontSize: '0.6875rem', '& .MuiButton-endIcon': { ml: 0 } }}
      >
        {value}
      </Button>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {PERFORMANCE_RANGES.map((range) => (
          <MenuItem
            key={range}
            selected={range === value}
            onClick={() => {
              onChange(range)
              setAnchor(null)
            }}
          >
            {RANGE_LABELS[range]}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

function PerformanceChart({ points }: { points: PerformancePoint[] }) {
  const theme = useTheme()
  const gradientId = useId().replace(/:/g, '')
  const color = theme.palette.primary.main
  const values = points.map((p) => p.value)
  const low = Math.min(...values)
  const high = Math.max(...values)
  // Scale to the range shown (not from zero) so day-to-day movement is visible.
  const padding = (high - low) * 0.08 || high * 0.01

  return (
    <Box
      sx={{
        height: CHART_HEIGHT,
        borderRadius: '9px',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${alpha(color, 0.07)}, transparent)`,
      }}
    >
      <LineChart
        hideLegend
        grid={{ horizontal: true }}
        margin={{ top: 12, right: 0, bottom: 0, left: 0 }}
        xAxis={[
          {
            data: points.map((p) => isoDateToUtc(p.date)),
            scaleType: 'time',
            position: 'none',
            valueFormatter: (value: Date) => formatDate(toIsoDate(value)),
          },
        ]}
        yAxis={[{ position: 'none', min: low - padding, max: high + padding }]}
        series={[
          {
            data: values,
            label: 'Portfolio value',
            color,
            area: true,
            baseline: 'min',
            showMark: false,
            curve: 'linear',
            valueFormatter: (value) => formatCurrency(value),
          },
        ]}
        sx={{
          [`& .${lineClasses.area}`]: { fill: `url(#${gradientId})` },
          [`& .${lineClasses.line}`]: { strokeWidth: 3, strokeLinecap: 'round' },
          [`& .${chartsGridClasses.line}`]: {
            stroke: theme.palette.divider,
            strokeDasharray: '4 5',
          },
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity={0.27} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      </LineChart>
    </Box>
  )
}

/** The reference's "Account performance" panel: holdings value over a selectable range. */
export function AccountPerformancePanel({
  totalReturnPercent,
}: {
  totalReturnPercent: number | undefined
}) {
  const performance = usePortfolioPerformance()
  const [range, setRange] = useState<PerformanceRange>('6M')
  const points = useMemo(
    () => (performance.data ? pointsInRange(performance.data.points, range) : []),
    [performance.data, range],
  )
  const hasValue = points.some((p) => p.value > 0)

  return (
    <Panel title="Account performance" actions={<RangeMenu value={range} onChange={setRange} />}>
      {performance.isError ? (
        <ErrorState error={performance.error} onRetry={() => performance.refetch()} />
      ) : performance.isPending ? (
        <LoadingState label="Loading account performance" minHeight={205} />
      ) : !hasValue ? (
        <EmptyState title="No performance yet" message="Add a holding to start tracking value." />
      ) : (
        <PerformanceChart points={points} />
      )}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: '9px', md: '15px' },
          mt: '11px',
          color: 'text.secondary',
          fontSize: '0.6875rem',
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <Box
            component="i"
            aria-hidden
            sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main' }}
          />
          Portfolio value
        </Box>
        {totalReturnPercent != null && (
          <SignedValue
            value={totalReturnPercent}
            format={(v) => `${formatPercent(v)} total return`}
          />
        )}
      </Box>
    </Panel>
  )
}
