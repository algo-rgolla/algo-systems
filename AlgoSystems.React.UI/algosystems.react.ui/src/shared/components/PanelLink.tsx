import NorthEastIcon from '@mui/icons-material/NorthEast'
import Link from '@mui/material/Link'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'

interface PanelLinkProps {
  to: string
  children: ReactNode
}

/** The small "View all ↗" link in a panel header. */
export function PanelLink({ to, children }: PanelLinkProps) {
  return (
    <Link
      component={RouterLink}
      to={to}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        fontSize: '0.6875rem',
        whiteSpace: 'nowrap',
        borderRadius: '4px',
      }}
    >
      {children}
      <NorthEastIcon aria-hidden sx={{ fontSize: 11 }} />
    </Link>
  )
}
