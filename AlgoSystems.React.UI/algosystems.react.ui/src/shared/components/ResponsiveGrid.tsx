import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

interface ResponsiveGridProps {
  /** Minimum width of each cell before the grid wraps to fewer columns. */
  minItemWidth?: number
  children: ReactNode
}

/** Auto-fitting CSS grid for tiles and panels. */
export function ResponsiveGrid({ minItemWidth = 200, children }: ResponsiveGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: `repeat(auto-fill, minmax(min(${minItemWidth}px, 100%), 1fr))`,
      }}
    >
      {children}
    </Box>
  )
}
