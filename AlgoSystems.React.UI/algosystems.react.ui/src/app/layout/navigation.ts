import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { SvgIconComponent } from '@mui/icons-material'

export interface NavItem {
  label: string
  /** Label for the bottom navigation on phones, where space is tight. */
  shortLabel?: string
  path: string
  icon: SvgIconComponent
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: GridViewOutlinedIcon },
  { label: 'Portfolio', path: '/portfolio', icon: AccountBalanceWalletOutlinedIcon },
  {
    label: 'Portfolio History',
    shortLabel: 'History',
    path: '/portfolio/history',
    icon: TrendingUpIcon,
  },
  { label: 'Stock Scans', shortLabel: 'Scans', path: '/scans', icon: ManageSearchIcon },
  { label: 'Watchlist', path: '/watchlist', icon: StarBorderIcon },
]
