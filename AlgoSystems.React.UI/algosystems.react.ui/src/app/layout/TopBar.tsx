import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { useIsFetching } from '@tanstack/react-query'
import { Link as RouterLink, useNavigation } from 'react-router'
import { DemoModeBadge } from './DemoModeBadge'
import { TOP_BAR_HEIGHT } from './dimensions'

function Brand() {
  return (
    <Box
      component={RouterLink}
      to="/"
      sx={{
        color: 'text.primary',
        textDecoration: 'none',
        fontWeight: 850,
        fontSize: { xs: '1rem', md: '1.125rem' },
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
      }}
    >
      <Box component="span" aria-hidden sx={{ color: 'primary.main', mr: 1 }}>
        ◈
      </Box>
      ALGO{' '}
      <Box component="span" sx={{ color: 'primary.main' }}>
        SYSTEMS
      </Box>
    </Box>
  )
}

export function TopBar() {
  const navigation = useNavigation()
  const fetching = useIsFetching()
  const busy = navigation.state === 'loading' || fetching > 0

  return (
    <AppBar position="sticky" component="header">
      <Toolbar
        disableGutters
        sx={{
          // The AppBar's 1px bottom border makes up the rest of the height. minHeight overrides
          // Toolbar's own responsive minimum (64px above 600px wide).
          height: { xs: TOP_BAR_HEIGHT.phone - 1, md: TOP_BAR_HEIGHT.desktop - 1 },
          minHeight: { xs: TOP_BAR_HEIGHT.phone - 1, md: TOP_BAR_HEIGHT.desktop - 1 },
          px: { xs: '11px', sm: '15px', md: '26px' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Brand />
        <Stack direction="row" sx={{ alignItems: 'center', gap: '12px' }}>
          <DemoModeBadge />
          {/* Placeholder until authentication is wired up. */}
          <Avatar role="img" aria-label="User profile">
            U
          </Avatar>
        </Stack>
      </Toolbar>
      {busy && (
        <LinearProgress sx={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2 }} />
      )}
    </AppBar>
  )
}
