import Box from '@mui/material/Box'
import { Outlet } from 'react-router'
import { MOBILE_NAV_CLEARANCE, SIDEBAR_WIDTH, TOP_BAR_HEIGHT } from './dimensions'
import { MobileNavigation } from './MobileNavigation'
import { Sidebar } from './Sidebar'
import { MAIN_CONTENT_ID, SkipLink } from './SkipLink'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <>
      <SkipLink />
      <TopBar />
      <Box
        sx={{
          display: { xs: 'block', md: 'grid' },
          gridTemplateColumns: {
            md: `${SIDEBAR_WIDTH.narrow}px minmax(0, 1fr)`,
            lg: `${SIDEBAR_WIDTH.wide}px minmax(0, 1fr)`,
          },
          minHeight: {
            xs: `calc(100vh - ${TOP_BAR_HEIGHT.phone}px)`,
            md: `calc(100vh - ${TOP_BAR_HEIGHT.desktop}px)`,
          },
        }}
      >
        <Sidebar />
        <Box
          component="main"
          id={MAIN_CONTENT_ID}
          // Focusable so the skip link moves focus here, but not a tab stop itself.
          tabIndex={-1}
          sx={{
            '&:focus-visible': { outline: 'none' },
            width: '100%',
            maxWidth: 1600,
            minWidth: 0,
            mx: 'auto',
            pt: { xs: '12px', lg: '14px' },
            px: { xs: '10px', sm: '14px', md: '20px', lg: '30px' },
            pb: { xs: `${MOBILE_NAV_CLEARANCE}px`, md: '38px', lg: '48px' },
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <MobileNavigation />
    </>
  )
}
