import Box from '@mui/material/Box'
import { StatusPill } from '@/shared/components/StatusPill'

/** Always-visible notice that every price, scan and portfolio in the app is simulated. */
export function DemoModeBadge() {
  return (
    <StatusPill tone="warn">
      Demo data
      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
        &nbsp;· simulated prices, not live
      </Box>
    </StatusPill>
  )
}
