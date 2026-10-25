import BarChartIcon from '@mui/icons-material/BarChart'
import StackedLineChartIcon from '@mui/icons-material/StackedLineChart'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Skeleton from '@mui/material/Skeleton'
import Tooltip from '@mui/material/Tooltip'
import type { SxProps, Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'
import { SCAN_CATALOG } from './catalog'
import type { ScanSummary } from './model'
import type { ScanType } from './types'

const SCAN_ICONS: Record<ScanType, SvgIconComponent> = {
  'unusual-volume': BarChartIcon,
  'big-gainers': TrendingUpIcon,
  'ema-crossover': StackedLineChartIcon,
}

const resultsText = (count: number) => `${count} ${count === 1 ? 'result' : 'results'}`

const tileSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: '10px',
  minWidth: 0,
  px: '12px',
  py: '9px',
  border: 1,
  borderColor: 'tile.border',
  borderRadius: '10px',
  bgcolor: 'tile.bg',
  color: 'text.primary',
  textAlign: 'left',
  textDecoration: 'none',
  transition: 'border-color 150ms, background 150ms',
  '&:hover': { borderColor: 'tile.hoverBorder' },
  '&[aria-pressed="true"]': {
    borderColor: 'primary.main',
    background: (theme) => theme.palette.tile.selectedBg,
    boxShadow: (theme) => `inset 0 0 0 1px ${theme.palette.tile.selectedRing}`,
    '& .scan-count': { color: 'primary.main' },
  },
}

function TileContent({
  scanType,
  count,
  arrow,
}: {
  scanType: ScanType
  count: number | null
  arrow: boolean
}) {
  const Icon = SCAN_ICONS[scanType]
  return (
    <>
      <Box
        component="span"
        aria-hidden
        sx={{
          display: 'grid',
          placeItems: 'center',
          flex: '0 0 26px',
          height: 26,
          borderRadius: '8px',
          bgcolor: 'tile.iconBg',
          color: 'primary.main',
        }}
      >
        <Icon sx={{ fontSize: 16 }} />
      </Box>
      <Box
        component="span"
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: '0.8125rem',
          fontWeight: 720,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {SCAN_CATALOG[scanType].label}
      </Box>
      <Box
        component="span"
        className="scan-count"
        sx={{ color: 'text.secondary', fontSize: '0.6875rem', whiteSpace: 'nowrap' }}
      >
        {count == null ? <Skeleton width={56} /> : `${resultsText(count)}${arrow ? ' →' : ''}`}
      </Box>
    </>
  )
}

/** Scans in display order with their latest counts; `summaries` is undefined while loading. */
type Summaries = ScanSummary[] | undefined

const countOf = (summaries: Summaries, scanType: ScanType) =>
  summaries?.find((s) => s.scanType === scanType)?.resultCount ?? null

function TileGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '8px',
      }}
    >
      {children}
    </Box>
  )
}

const SCAN_ORDER = Object.keys(SCAN_CATALOG) as ScanType[]

/** Tiles that link to each scan's results, as on the dashboard. */
export function ScanLinkTiles({
  summaries,
  linkTo,
}: {
  summaries: Summaries
  linkTo: (scanType: ScanType) => string
}) {
  return (
    <TileGrid>
      {SCAN_ORDER.map((scanType) => {
        const count = countOf(summaries, scanType)
        const label = SCAN_CATALOG[scanType].label
        return (
          <Tooltip key={scanType} title={SCAN_CATALOG[scanType].description} describeChild>
            <ButtonBase
              component={RouterLink}
              to={linkTo(scanType)}
              aria-label={
                count == null ? `Open ${label} scan` : `Open ${label} scan, ${resultsText(count)}`
              }
              sx={tileSx}
            >
              <TileContent scanType={scanType} count={count} arrow />
            </ButtonBase>
          </Tooltip>
        )
      })}
    </TileGrid>
  )
}

/** A single-choice selector of scan type, as on the Stock Scans page. */
export function ScanTypeSelector({
  summaries,
  value,
  onChange,
}: {
  summaries: Summaries
  value: ScanType
  onChange: (scanType: ScanType) => void
}) {
  return (
    <TileGrid>
      {SCAN_ORDER.map((scanType) => (
        <Tooltip key={scanType} title={SCAN_CATALOG[scanType].description} describeChild>
          <ButtonBase
            aria-pressed={scanType === value}
            onClick={() => onChange(scanType)}
            sx={tileSx}
          >
            <TileContent scanType={scanType} count={countOf(summaries, scanType)} arrow={false} />
          </ButtonBase>
        </Tooltip>
      ))}
    </TileGrid>
  )
}
