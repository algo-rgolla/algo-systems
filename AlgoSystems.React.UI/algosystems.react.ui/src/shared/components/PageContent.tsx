import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

/** Stacks a page's sections with the design's vertical rhythm (16px, 12px on phones). */
export function PageContent({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: '12px', md: '16px' } }}>
      {children}
    </Box>
  )
}

/**
 * Two panels side by side, the first wider (1.4fr / 0.8fr, min 280px).
 * Stacks into one column at 1100px and below.
 */
export function SplitLayout({ children }: { children: [ReactNode, ReactNode] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: '12px', md: '16px' },
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)' },
      }}
    >
      {children}
    </Box>
  )
}
