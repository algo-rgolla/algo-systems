import LinearProgress from '@mui/material/LinearProgress'

interface ProgressBarProps {
  /** 0–100. Values outside the range are clamped. */
  value: number
  /** What the bar measures, for screen readers. */
  label: string
  tone?: 'primary' | 'up' | 'down'
}

const barColor = { primary: 'primary.main', up: 'market.up', down: 'market.down' }

/** A thin share-of-total bar, e.g. sector allocation or win rate. */
export function ProgressBar({ value, label, tone = 'primary' }: ProgressBarProps) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.min(100, Math.max(0, value))}
      aria-label={label}
      sx={{ '& .MuiLinearProgress-bar': { bgcolor: barColor[tone] } }}
    />
  )
}
