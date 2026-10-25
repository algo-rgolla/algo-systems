import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

interface LoadingStateProps {
  /** Announced to screen readers. */
  label?: string
  minHeight?: number
}

/** A centred spinner for panels whose content has no skeleton shape. */
export function LoadingState({ label = 'Loading', minHeight = 160 }: LoadingStateProps) {
  return (
    <Box role="status" sx={{ display: 'grid', placeItems: 'center', minHeight }}>
      <CircularProgress size={24} aria-label={label} />
    </Box>
  )
}
