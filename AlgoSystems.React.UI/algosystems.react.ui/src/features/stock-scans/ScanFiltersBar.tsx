import SearchIcon from '@mui/icons-material/Search'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { MARKETS, type Market } from '@/features/stocks/markets'
import {
  DEFAULT_SCAN_FILTERS,
  hasActiveFilters,
  MIN_SCORE_OPTIONS,
  type ScanFilters,
} from './filters'

interface ScanFiltersBarProps {
  filters: ScanFilters
  onChange: (filters: ScanFilters) => void
  sectors: string[]
  signals: string[]
}

const controlSx = { minWidth: 150, '& .MuiInputBase-root': { fontSize: '0.75rem' } }

/** Search and filter controls for a scan's results, in the design's `.filters` row. */
export function ScanFiltersBar({ filters, onChange, sectors, signals }: ScanFiltersBarProps) {
  const set = <K extends keyof ScanFilters>(key: K, value: ScanFilters[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <Box
      role="search"
      aria-label="Filter scan results"
      sx={{
        display: { xs: 'grid', md: 'flex' },
        gridTemplateColumns: '1fr 1fr',
        flexWrap: 'wrap',
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
        label="Sector"
        value={filters.sector}
        onChange={(e) => set('sector', e.target.value)}
        sx={controlSx}
      >
        <MenuItem value="all">All sectors</MenuItem>
        {sectors.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Signal"
        value={filters.signal}
        onChange={(e) => set('signal', e.target.value)}
        sx={controlSx}
      >
        <MenuItem value="all">All signals</MenuItem>
        {signals.map((s) => (
          <MenuItem key={s} value={s}>
            {s}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="Minimum score"
        value={filters.minScore}
        onChange={(e) => set('minScore', Number(e.target.value))}
        sx={controlSx}
      >
        {MIN_SCORE_OPTIONS.map((s) => (
          <MenuItem key={s} value={s}>
            {s === 0 ? 'Any score' : `${s} or more`}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant="outlined"
        onClick={() => onChange(DEFAULT_SCAN_FILTERS)}
        disabled={!hasActiveFilters(filters)}
      >
        Clear filters
      </Button>
    </Box>
  )
}
