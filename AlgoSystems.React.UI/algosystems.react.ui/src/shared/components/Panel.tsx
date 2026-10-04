import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PanelProps {
  title?: string
  actions?: ReactNode
  children: ReactNode
}

/** A flat, bordered section with an optional header row. */
export function Panel({ title, actions, children }: PanelProps) {
  return (
    <Paper variant="outlined" component="section">
      {(title || actions) && (
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            minHeight: 44,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {title && <Typography variant="h3">{title}</Typography>}
          {actions}
        </Stack>
      )}
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  )
}
