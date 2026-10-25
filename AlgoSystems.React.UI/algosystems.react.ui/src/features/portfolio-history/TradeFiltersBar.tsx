import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { MARKETS, type Market } from '@/features/stocks/markets'
import type { IsoDate } from '@/shared/formatting/dates'
import {
  dateRangeError,
  DEFAULT_TRADE_FILTERS,
  hasActiveTradeFilters,
  type ClosedTradeFilters,
} from './filters'
import { OUTCOME_LABELS } from './model'
import type { TradeOutcome } from './types'

interface TradeFiltersBarProps {
  filters: ClosedTradeFilters
  onChange: (filters: ClosedTradeFilters) => void
}

const controlSx = { minWidth: 150, '& .MuiInputBase-root': { fontSize: '0.75rem' } }

/** Search and filters for the closed trades, in the design's `.filters` row. */
export function TradeFiltersBar({ filters, onChange }: TradeFiltersBarProps) {
  const set = <K extends keyof ClosedTradeFilters>(key: K, value: ClosedTradeFilters[K]) =>
    onChange({ ...filters, [key]: value })
  const rangeError = dateRangeError(filters)

  return (
    <Box
      role="search"
      aria-label="Filter closed trades"
      sx={{
        display: { xs: 'grid', md: 'flex' },
        gridTemplateColumns: '1fr 1fr',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        gap: '9px',
        mb: '15px',
        '& > :first-of-type': { gridColumn: '1 / -1' },
      }}
    >
      <TextField
        size="small"
        label="Search"
        placeholder="Symbol or company"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
        sx={{ ...controlSx, minWidth: { md: 220 } }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        size="small"
        label="Market"
        value={filters.market}
        onChange={(e) => set('market', e.target.value as Market | 'all')}
        sx={controlSx}
      >
        <MenuItem value="all">All markets</MenuItem>
        {Object.values(MARKETS).map((m) => (
          <MenuItem key={m.code} value={m.code}>
            {m.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Outcome"
        value={filters.outcome}
        onChange={(e) => set('outcome', e.target.value as TradeOutcome | 'all')}
        sx={controlSx}
      >
        <MenuItem value="all">All outcomes</MenuItem>
        {(Object.keys(OUTCOME_LABELS) as TradeOutcome[]).map((o) => (
          <MenuItem key={o} value={o}>
            {o === 'win' ? 'Wins' : o === 'loss' ? 'Losses' : 'Break-even'}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        type="date"
        label="Exited from"
        value={filters.from}
        onChange={(e) => set('from', e.target.value as IsoDate | '')}
        error={Boolean(rangeError)}
        sx={controlSx}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.to || undefined } }}
      />
      <TextField
        size="small"
        type="date"
        label="Exited to"
        value={filters.to}
        onChange={(e) => set('to', e.target.value as IsoDate | '')}
        error={Boolean(rangeError)}
        helperText={rangeError}
        sx={controlSx}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filters.from || undefined } }}
      />
      <Button
        variant="outlined"
        onClick={() => onChange(DEFAULT_TRADE_FILTERS)}
        disabled={!hasActiveTradeFilters(filters)}
        sx={{ alignSelf: { md: 'flex-start' }, minHeight: 40 }}
      >
        Clear filters
      </Button>
    </Box>
  )
}
