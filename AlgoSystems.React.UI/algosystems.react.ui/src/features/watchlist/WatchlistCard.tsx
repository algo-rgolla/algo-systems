import StarIcon from '@mui/icons-material/Star'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { MARKETS } from '@/features/stocks/markets'
import { MetricRow } from '@/shared/components/MetricRow'
import { SignedValue } from '@/shared/components/SignedValue'
import { formatDate, formatPercent, formatPrice } from '@/shared/formatting/format'
import type { WatchlistItem } from './types'
import { WatchlistChart } from './WatchlistChart'

interface WatchlistCardProps {
  item: WatchlistItem
  onRemove: (item: WatchlistItem) => void
}

/** One watched stock: identity, last close, day change, daily chart and sector. */
export function WatchlistCard({ item, onRemove }: WatchlistCardProps) {
  const { stock, quote } = item
  const removeLabel = `Remove ${stock.symbol} from watchlist`

  return (
    <Paper
      variant="panel"
      component="article"
      aria-label={`${stock.symbol}, ${stock.name}`}
      sx={{
        p: { xs: '14px', md: '16px' },
        borderRadius: '13px',
        backgroundImage: 'none',
        bgcolor: 'tile.bg',
        borderColor: 'tile.border',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <Box
            aria-hidden
            sx={{
              flex: '0 0 36px',
              height: 36,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '11px',
              bgcolor: 'tile.iconBg',
              color: 'primary.light',
              fontWeight: 800,
              fontSize: '0.6875rem',
            }}
          >
            {stock.symbol.slice(0, 2)}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="h2" sx={{ fontWeight: 780, letterSpacing: '0.15px' }}>
              {stock.symbol}
            </Typography>
            <Typography variant="caption" component="p" noWrap sx={{ color: 'text.secondary' }}>
              {stock.name} · {MARKETS[stock.market].label}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Remove from watchlist">
          <IconButton
            aria-label={removeLabel}
            onClick={() => onRemove(item)}
            size="small"
            sx={{
              border: 1,
              borderColor: 'line.strong',
              borderRadius: '9px',
              bgcolor: 'surface.control',
              color: 'primary.main',
            }}
          >
            <StarIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Typography
        sx={{
          fontSize: { xs: '1.375rem', md: '1.4375rem' },
          fontWeight: 780,
          letterSpacing: '-0.5px',
          mt: '17px',
          mb: '5px',
        }}
      >
        {formatPrice(quote.price, stock.currency)}
      </Typography>
      <Typography variant="caption" component="p">
        <SignedValue value={quote.changePercent} format={formatPercent} />{' '}
        <Box component="span" sx={{ color: 'text.secondary' }}>
          on {formatDate(quote.asOf)} close
        </Box>
      </Typography>

      <WatchlistChart stock={stock} />

      <MetricRow
        label={
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Sector
          </Typography>
        }
        value={
          <Typography variant="caption" sx={{ fontWeight: 400 }}>
            {stock.sector}
          </Typography>
        }
      />
    </Paper>
  )
}
