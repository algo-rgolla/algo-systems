import MenuIcon from '@mui/icons-material/Menu'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useIsFetching } from '@tanstack/react-query'
import { useState } from 'react'
import { NavLink, Outlet, useNavigation } from 'react-router'
import { NAV_ITEMS } from './navigation'

const DRAWER_WIDTH = 220

function Brand() {
  return (
    <Typography
      component="span"
      sx={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.02em' }}
    >
      Algo
      <Box component="span" sx={{ color: 'primary.main' }}>
        Systems
      </Box>
    </Typography>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <List component="nav" aria-label="Main" sx={{ px: 1, py: 1.5 }}>
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
        <ListItemButton
          key={path}
          component={NavLink}
          to={path}
          end={path === '/'}
          onClick={onNavigate}
          sx={{
            mb: 0.25,
            color: 'text.secondary',
            '&.active': { color: 'text.primary', bgcolor: 'action.selected' },
            '&.active .MuiListItemIcon-root': { color: 'primary.main' },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={label}
            slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 500 } } }}
          />
        </ListItemButton>
      ))}
    </List>
  )
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigation = useNavigation()
  const fetching = useIsFetching()
  const busy = navigation.state === 'loading' || fetching > 0

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar variant="dense" sx={{ gap: 1.5, minHeight: 52 }}>
          <IconButton
            edge="start"
            aria-label="Open navigation"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Brand />
        </Toolbar>
        {busy && (
          <LinearProgress sx={{ position: 'absolute', bottom: -1, left: 0, right: 0, height: 2 }} />
        )}
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 52 }}>
            <Brand />
          </Toolbar>
          <NavList onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 52 }} />
          <NavList />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
        <Toolbar variant="dense" sx={{ minHeight: 52 }} />
        <Box
          sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 2.5, sm: 4 }, maxWidth: 1600, mx: 'auto' }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
