import Box from '@mui/material/Box'
import { StatusPill } from '@/shared/components/StatusPill'
import { DEMO_MODE } from '@/shared/config'

/** Always-visible notice that prices and portfolios are simulated, shown only in demo mode. */
export function DemoModeBadge() {
  if (!DEMO_MODE) return null

  return (
    <StatusPill tone="warn">
      Demo data
      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
        &nbsp;· simulated prices, not live
      </Box>
    </StatusPill>
  )
}
