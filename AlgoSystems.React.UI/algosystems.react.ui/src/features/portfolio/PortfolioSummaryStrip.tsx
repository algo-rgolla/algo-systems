import { StatCell, StatStrip } from '@/shared/components/StatStrip'
import { directionOf } from '@/shared/formatting/direction'
import { formatCurrency, formatPercent } from '@/shared/formatting/format'
import type { PortfolioSummary } from './types'

/** The reference's four summary cells, all in the portfolio's base currency. */
export function PortfolioSummaryStrip({ summary }: { summary: PortfolioSummary | undefined }) {
  const loading = !summary
  const money = (value: number | undefined, signed = false) =>
    formatCurrency(value ?? null, { currency: summary?.baseCurrency, signed })
  const positions = summary?.positionCount ?? 0

  return (
    <StatStrip>
      <StatCell
        label="Total market value"
        loading={loading}
        value={money(summary?.totalMarketValue)}
        detail={`Across ${positions} ${positions === 1 ? 'position' : 'positions'}`}
      />
      <StatCell
        label="Total return"
        loading={loading}
        value={money(summary?.totalReturn, true)}
        detail={`${formatPercent(summary?.totalReturnPercent ?? null)} all time`}
        detailDirection={directionOf(summary?.totalReturn)}
      />
      <StatCell
        label="Today’s change"
        loading={loading}
        value={money(summary?.dayChange, true)}
        detail={`${formatPercent(summary?.dayChangePercent ?? null)} today`}
        detailDirection={directionOf(summary?.dayChange)}
      />
      <StatCell
        label="Cash available"
        loading={loading}
        value={money(summary?.cash)}
        detail={`${formatPercent(summary?.cashPercent ?? null, { signed: false, decimals: 1 })} of account`}
      />
    </StatStrip>
  )
}
