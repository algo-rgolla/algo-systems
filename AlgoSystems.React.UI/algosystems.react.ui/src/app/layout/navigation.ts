import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined'
import ShowChartIcon from '@mui/icons-material/ShowChart'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import type { SvgIconComponent } from '@mui/icons-material'

export interface NavItem {
  label: string
  path: string
  icon: SvgIconComponent
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: DashboardOutlinedIcon },
  { label: 'Screener', path: '/screener', icon: FilterAltOutlinedIcon },
  { label: 'Watchlist', path: '/watchlist', icon: StarBorderIcon },
  { label: 'Strategies', path: '/portfolio', icon: ShowChartIcon },
  { label: 'Trades', path: '/trades', icon: AccountBalanceWalletOutlinedIcon },
]
