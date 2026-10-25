import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

interface MetricRowProps {
  label: ReactNode
  value: ReactNode
}

/** A label/value row in a panel list, separated from the next row by a rule. */
export function MetricRow({ label, value }: MetricRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        py: '13px',
        borderBottom: 1,
        borderColor: 'line.row',
        '&:first-of-type': { pt: '3px' },
        '&:last-child': { borderBottom: 0, pb: '2px' },
      }}
    >
      <Box component="span" sx={{ minWidth: 0 }}>
        {label}
      </Box>
      <Box component="span" sx={{ fontWeight: 700, textAlign: 'right' }}>
        {value}
      </Box>
    </Box>
  )
}
