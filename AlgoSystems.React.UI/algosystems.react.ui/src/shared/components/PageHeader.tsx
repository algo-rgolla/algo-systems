import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  actions?: ReactNode
}

export function PageHeader({ title, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: { xs: '12px', md: '18px' },
        mb: { xs: '17px', md: '20px' },
      }}
    >
      <Typography variant="h1">{title}</Typography>
      {actions && (
        <Stack
          direction="row"
          sx={{
            gap: '9px',
            flexWrap: 'wrap',
            // On phones the actions fill the row, sharing it equally.
            '& > .MuiButton-root': { flex: { xs: 1, md: 'none' } },
          }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
  )
}
