import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface StatTileProps {
  label: string
  value: ReactNode
  hint?: ReactNode
  loading?: boolean
}

export function StatTile({ label, value, hint, loading = false }: StatTileProps) {
  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.75, minWidth: 0 }}>
      <Typography variant="overline" component="div" sx={{ color: 'text.secondary' }} noWrap>
        {label}
      </Typography>
      <Typography component="div" sx={{ fontSize: '1.375rem', fontWeight: 600, lineHeight: 1.3 }}>
        {loading ? <Skeleton width="60%" /> : value}
      </Typography>
      {hint && (
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mt: 0.25 }}>
          {hint}
        </Typography>
      )}
    </Paper>
  )
}
