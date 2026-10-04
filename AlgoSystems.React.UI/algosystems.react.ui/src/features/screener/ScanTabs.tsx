import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import type { ScanCounter } from './api'

interface ScanTabsProps {
  counters: ScanCounter[] | undefined
  value: string | null
  onChange: (scanType: string) => void
}

export function ScanTabs({ counters, value, onChange }: ScanTabsProps) {
  if (!counters) return <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />

  return (
    <Tabs
      value={value ?? false}
      onChange={(_, next: string) => onChange(next)}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      {counters.map((scan) => (
        <Tab
          key={scan.scanType}
          value={scan.scanType}
          label={
            <Box component="span" sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
              {scan.label}
              <Box
                component="span"
                sx={{
                  px: 0.75,
                  borderRadius: 0.5,
                  fontSize: '0.75rem',
                  bgcolor: 'action.selected',
                  color: 'text.secondary',
                }}
              >
                {scan.count}
              </Box>
            </Box>
          }
        />
      ))}
    </Tabs>
  )
}
