import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Toolbar from '@mui/material/Toolbar'
import { useIsFetching } from '@tanstack/react-query'
import { Link as RouterLink, useNavigation } from 'react-router'
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
          height: { xs: TOP_BAR_HEIGHT.phone, md: TOP_BAR_HEIGHT.desktop },
          px: { xs: '11px', sm: '15px', md: '26px' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Brand />
        {/* Placeholder until authentication is wired up. */}
        <Avatar aria-label="User profile">U</Avatar>
      </Toolbar>
      {busy && (
        <LinearProgress sx={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2 }} />
      )}
    </AppBar>
  )
}
