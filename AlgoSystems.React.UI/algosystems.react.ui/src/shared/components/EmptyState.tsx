import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  message?: ReactNode
  /** e.g. an "Add holding" button. */
  action?: ReactNode
}

/** Shown in place of a list or table that has nothing in it yet. */
export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', gap: '6px', py: '28px', px: 2 }}>
      <InboxOutlinedIcon aria-hidden sx={{ fontSize: 28, color: 'text.secondary', mb: '4px' }} />
      <Typography variant="subtitle2" component="p">
        {title}
      </Typography>
      {message && (
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
          {message}
        </Typography>
      )}
      {action && <Stack sx={{ mt: '10px' }}>{action}</Stack>}
    </Stack>
  )
}
