import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  /** Shown on the right of the header row, e.g. a "View all" link. */
  actions?: ReactNode
  /** Less space under the header, for compact content such as selector tiles. */
  tightHeader?: boolean
  children: ReactNode
}

/** A gradient card section with an optional header row. */
export function Panel({ title, actions, tightHeader = false, children }: PanelProps) {
  return (
    <Paper variant="panel" component="section" sx={{ p: { xs: '12px', sm: '14px', md: '18px' } }}>
      {(title || actions) && (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            mb: tightHeader ? '11px' : { xs: '11px', md: '15px' },
          }}
        >
          {title && (
            <Typography variant="h3" component="h2">
              {title}
            </Typography>
          )}
          {actions}
        </Stack>
      )}
      {children}
    </Paper>
  )
}
