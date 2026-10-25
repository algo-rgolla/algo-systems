import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navigation'

/** Desktop and tablet navigation. Hidden on phones, where MobileNavigation takes over. */
export function Sidebar() {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        px: '14px',
        py: '23px',
        bgcolor: 'surface.chrome',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      <List component="nav" aria-label="Main navigation" disablePadding>
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <ListItemButton
            key={path}
            component={NavLink}
            to={path}
            end
            disableRipple
            sx={{
              gap: '12px',
              minHeight: 50,
              my: '3px',
              px: '14px',
              py: '13px',
              borderRadius: '10px',
              fontSize: '0.8125rem',
              color: 'nav.text',
              '&:hover': { bgcolor: 'nav.hover', color: 'common.white' },
              '&.active': {
                bgcolor: 'nav.active',
                color: 'common.white',
                boxShadow: (theme) => `inset 3px 0 ${theme.palette.primary.main}`,
              },
            }}
          >
            <Icon sx={{ width: 20, fontSize: 18 }} />
            {label}
          </ListItemButton>
        ))}
      </List>
      <Box
        sx={{
          mt: 'auto',
          pt: '17px',
          px: '11px',
          borderTop: 1,
          borderColor: 'divider',
          color: 'nav.footer',
          fontSize: '0.6875rem',
          lineHeight: 1.7,
        }}
      >
        ALGO SYSTEMS
      </Box>
    </Box>
  )
}
