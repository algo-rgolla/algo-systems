import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Panel } from './Panel'

/** Temporary body for pages that are not built yet. */
export function PagePlaceholder({ children }: { children: ReactNode }) {
  return (
    <Panel>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {children}
      </Typography>
    </Panel>
  )
}
