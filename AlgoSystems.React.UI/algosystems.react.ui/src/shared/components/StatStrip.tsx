import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import type { ReactNode } from 'react'
import type { Direction } from '@/shared/formatting/direction'

/** A row of equal-width summary cells. Cells stay on one row at every width, as in the design. */
export function StatStrip({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(0, 1fr)',
        gap: { xs: '8px', md: '14px' },
      }}
    >
      {children}
    </Box>
  )
}

interface StatCellProps {
  label: string
  value: ReactNode
  /** Secondary text beside the value, e.g. "+12.90% all time". */
  detail?: ReactNode
  /** Colours the detail by direction; omit for muted text. */
  detailDirection?: Direction
  loading?: boolean
}

export function StatCell({
  label,
  value,
  detail,
  detailDirection,
  loading = false,
}: StatCellProps) {
  return (
    <Paper
      variant="panel"
      sx={{ borderRadius: '12px', px: { xs: '12px', md: '22px' }, py: { xs: '11px', md: '14px' } }}
    >
      <Box
        sx={{
          color: 'text.label',
          fontSize: { xs: '0.625rem', md: '0.6875rem' },
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          columnGap: '10px',
          rowGap: '4px',
          mt: '7px',
        }}
      >
        <Box
          component="span"
          sx={{
            // While loading, a 72px placeholder that can shrink inside narrow cells.
            flex: loading ? '0 1 72px' : undefined,
            minWidth: 0,
            fontSize: { xs: '0.875rem', md: '1.0625rem' },
            fontWeight: 780,
            letterSpacing: '-0.3px',
          }}
        >
          {loading ? <Skeleton /> : value}
        </Box>
        {detail && !loading && (
          <Box
            component="span"
            sx={{
              fontSize: { xs: '0.625rem', md: '0.6875rem' },
              whiteSpace: { md: 'nowrap' },
              color: detailDirection ? `market.${detailDirection}` : 'text.secondary',
            }}
          >
            {detail}
          </Box>
        )}
      </Box>
    </Paper>
  )
}
