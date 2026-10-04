import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'flex-end' }, mb: 3 }}
    >
      <div>
        <Typography variant="h1">{title}</Typography>
        {description && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            {description}
          </Typography>
        )}
      </div>
      {actions && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          {actions}
        </Stack>
      )}
    </Stack>
  )
}
