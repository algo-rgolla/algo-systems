import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { MetricRow } from '@/shared/components/MetricRow'
import { Panel } from '@/shared/components/Panel'
import { ProgressBar } from '@/shared/components/ProgressBar'
import { SignedValue } from '@/shared/components/SignedValue'
import { StatusPill } from '@/shared/components/StatusPill'
import { formatCurrency, formatPercent } from '@/shared/formatting/format'
import { highlightLabel, holdingPeriodLabel, shareOf } from './model'
import type { PortfolioHistorySummary } from './types'

const muted = (text: string) => (
  <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
    {text}
  </Typography>
)

function OutcomeRow({
  pill,
  description,
  count,
  total,
  tone,
}: {
  pill: ReactNode
  description: string
  count: number
  total: number
  tone: 'up' | 'down' | 'primary'
}) {
  const share = shareOf(count, total)
  const color = tone === 'up' ? 'market.up' : tone === 'down' ? 'market.down' : 'text.primary'
  return (
    <>
      <MetricRow
        label={
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            {pill}
            {muted(description)}
          </Box>
        }
        value={
          <Box component="span" sx={{ color }}>
            {count} {muted(`(${formatPercent(share, { signed: false, decimals: 0 })})`)}
          </Box>
        }
      />
      <ProgressBar value={share} tone={tone} label={`${description}: ${count} of ${total}`} />
    </>
  )
}

/** The reference's "Trade outcomes" panel: wins and losses as shares of the trades shown. */
export function TradeOutcomesPanel({ summary }: { summary: PortfolioHistorySummary }) {
  const total = summary.tradeCount
  return (
    <Panel title="Trade outcomes" actions={muted('Closed trades only')}>
      <OutcomeRow
        pill={<StatusPill>Wins</StatusPill>}
        description="Profitable trades"
        count={summary.wins}
        total={total}
        tone="up"
      />
      <OutcomeRow
        pill={<StatusPill tone="negative">Losses</StatusPill>}
        description="Unprofitable trades"
        count={summary.losses}
        total={total}
        tone="down"
      />
      {summary.breakeven > 0 && (
        <OutcomeRow
          pill={<StatusPill tone="neutral">Break-even</StatusPill>}
          description="No profit or loss"
          count={summary.breakeven}
          total={total}
          tone="primary"
        />
      )}
      <MetricRow
        label={muted('Average holding period')}
        value={holdingPeriodLabel(summary.averageHoldingDays)}
      />
    </Panel>
  )
}

/** The reference's "Performance summary" panel, in the base currency. */
export function PerformanceSummaryPanel({ summary }: { summary: PortfolioHistorySummary }) {
  const money = (v: number) =>
    formatCurrency(v, { currency: summary.baseCurrency, decimals: 2, signed: true })
  const signed = (value: number | null, text: string) => (
    <SignedValue value={value} format={() => text} />
  )

  return (
    <Panel title="Performance summary" actions={muted(`Realised, in ${summary.baseCurrency}`)}>
      <MetricRow
        label={muted('Gross profit')}
        value={signed(summary.grossProfit, money(summary.grossProfit))}
      />
      <MetricRow
        label={muted('Gross loss')}
        value={signed(summary.grossLoss, money(summary.grossLoss))}
      />
      <MetricRow
        label={muted('Best trade')}
        value={signed(
          summary.bestTrade?.realisedPnl ?? null,
          highlightLabel(summary.bestTrade, summary),
        )}
      />
      <MetricRow
        label={muted('Worst trade')}
        value={signed(
          summary.worstTrade?.realisedPnl ?? null,
          highlightLabel(summary.worstTrade, summary),
        )}
      />
    </Panel>
  )
}
