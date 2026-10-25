import { directionOf, type Direction } from '@/shared/formatting/direction'
import { formatCurrency, formatInteger, formatPercent } from '@/shared/formatting/format'
import type { PortfolioHistorySummary, TradeHighlight, TradeOutcome } from './types'

export const OUTCOME_LABELS: Record<TradeOutcome, string> = {
  win: 'Win',
  loss: 'Loss',
  breakeven: 'Break-even',
}

/** Which trades a summary covers, e.g. "All 40 closed trades" or "12 of 40 closed trades". */
export function summaryScope(shown: number, total: number): string {
  const trades = (n: number) => `${n} closed trade${n === 1 ? '' : 's'}`
  return shown === total ? `All ${trades(total)}` : `${shown} of ${trades(total)} (filtered)`
}

/** Share of all trades, 0–100; 0 when there are none. */
export function shareOf(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0
}

export interface ProfitFactorView {
  value: string
  detail: string
}

/**
 * Profit factor is gross profit ÷ |gross loss|. It is undefined without losses, so instead of
 * dividing by zero it reads "No losses" (or "—" when there is nothing to compare).
 */
export function profitFactorView(s: PortfolioHistorySummary): ProfitFactorView {
  const money = (v: number | null) =>
    formatCurrency(v, { currency: s.baseCurrency, decimals: 2, signed: true })
  const detail = `Avg win ${money(s.averageWin)} · Avg loss ${money(s.averageLoss)}`
  if (s.profitFactor != null) return { value: s.profitFactor.toFixed(2), detail }
  if (s.grossProfit > 0) return { value: 'No losses', detail }
  return { value: '—', detail: s.tradeCount ? 'No winning or losing trades' : 'No trades' }
}

export function winRateView(s: PortfolioHistorySummary): { value: string; detail: string } {
  const parts = [
    `${s.wins} win${s.wins === 1 ? '' : 's'}`,
    `${s.losses} loss${s.losses === 1 ? '' : 'es'}`,
  ]
  if (s.breakeven) parts.push(`${s.breakeven} break-even`)
  return {
    value: formatPercent(s.winRate, { signed: false, decimals: 0 }),
    detail: parts.join(' · '),
  }
}

export function netPnlView(s: PortfolioHistorySummary): {
  value: string
  detail: string
  direction: Direction
} {
  const label = s.netPnl > 0 ? 'Net profit' : s.netPnl < 0 ? 'Net loss' : 'Break-even'
  return {
    value: formatCurrency(s.netPnl, { currency: s.baseCurrency, decimals: 2, signed: true }),
    detail: `${label} · ${formatInteger(s.tradeCount)} trades`,
    direction: directionOf(s.netPnl),
  }
}

/** "TSM · +$550.80", or "—" when there are no trades. */
export function highlightLabel(trade: TradeHighlight | null, s: PortfolioHistorySummary): string {
  if (!trade) return '—'
  return `${trade.symbol} · ${formatCurrency(trade.realisedPnl, { currency: s.baseCurrency, decimals: 2, signed: true })}`
}

/** "26 days", or "—" when there are no trades. */
export function holdingPeriodLabel(days: number | null): string {
  if (days == null) return '—'
  const rounded = Math.round(days)
  return `${rounded} day${rounded === 1 ? '' : 's'}`
}
