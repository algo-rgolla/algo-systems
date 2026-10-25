import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import { alpha } from '@mui/material/styles'
import { NavLink } from 'react-router'
import { NAV_ITEMS } from './navigation'

/** Bottom navigation for phones (≤700px). */
export function MobileNavigation() {
  return (
    <Box
      component="nav"
      aria-label="Main navigation"
      sx={{
        display: { xs: 'grid', md: 'none' },
        gridTemplateColumns: `repeat(${NAV_ITEMS.length}, minmax(0, 1fr))`,
        gap: '3px',
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 'appBar',
        p: '7px',
        pb: 'max(7px, env(safe-area-inset-bottom))',
        bgcolor: (theme) => alpha(theme.palette.surface.chrome, 0.96),
        backdropFilter: 'blur(14px)',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      {NAV_ITEMS.map(({ label, shortLabel, path, icon: Icon }) => (
        <ButtonBase
          key={path}
          component={NavLink}
          to={path}
          end
          sx={{
            flexDirection: 'column',
            gap: '4px',
            minWidth: 0,
            minHeight: 49,
            px: '1px',
            py: '7px',
            borderRadius: '9px',
            fontSize: '0.5625rem',
            textAlign: 'center',
            color: 'nav.text',
            '&.active': { bgcolor: 'nav.active', color: 'common.white' },
            '&.active .MuiSvgIcon-root': { color: 'primary.main' },
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
          {shortLabel ?? label}
        </ButtonBase>
      ))}
    </Box>
  )
}
