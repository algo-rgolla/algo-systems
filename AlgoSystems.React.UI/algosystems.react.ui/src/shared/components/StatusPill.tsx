import Box from '@mui/material/Box'
import type { ReactNode } from 'react'

export type StatusTone = 'positive' | 'warn' | 'negative' | 'neutral'

interface StatusPillProps {
  tone?: StatusTone
  children: ReactNode
}

/** A small rounded label for scan signals, trade sides and outcomes. */
export function StatusPill({ tone = 'positive', children }: StatusPillProps) {
  const neutral = tone === 'neutral'

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: '8px',
        py: '5px',
        borderRadius: 99,
        fontSize: '0.625rem',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        bgcolor: neutral ? 'surface.overlay' : `signal.${tone}.bg`,
        color: neutral ? 'text.secondary' : `signal.${tone}.fg`,
      }}
    >
      {children}
    </Box>
  )
}
