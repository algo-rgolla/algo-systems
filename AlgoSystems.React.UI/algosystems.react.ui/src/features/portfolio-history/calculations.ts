import { roundMoney, sideSign, sum } from '@/features/stocks/calculations'
import { toBaseCurrency, type FxRates } from '@/features/stocks/currency'
import { daysBetween } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'
import type { ClosedTrade, PortfolioHistorySummary, TradeHighlight, TradeOutcome } from './types'

/** The fields a closed trade is recorded with; the rest are derived by `toClosedTrade`. */
export type ClosedTradeRecord = Omit<
  ClosedTrade,
  'realisedPnl' | 'returnPercent' | 'holdingDays' | 'outcome'
>

export function toClosedTrade(record: ClosedTradeRecord): ClosedTrade {
  const cost = record.entryPrice * record.quantity
  const realisedPnl = roundMoney(
    (record.exitPrice - record.entryPrice) * record.quantity * sideSign(record.side),
  )
  const outcome: TradeOutcome = realisedPnl > 0 ? 'win' : realisedPnl < 0 ? 'loss' : 'breakeven'

  return {
    ...record,
    realisedPnl,
    returnPercent: cost === 0 ? 0 : (realisedPnl / cost) * 100,
    holdingDays: daysBetween(record.entryDate, record.exitDate),
    outcome,
  }
}

export function summariseHistory(
  trades: ClosedTrade[],
  fxRates: FxRates,
  baseCurrency: CurrencyCode,
): PortfolioHistorySummary {
  const pnl = trades.map((t) => toBaseCurrency(t.realisedPnl, t.stock.currency, fxRates))
  const wins = pnl.filter((v) => v > 0)
  const losses = pnl.filter((v) => v < 0)
  const grossProfit = sum(wins)
  const grossLoss = sum(losses)

  const highlight = (index: number): TradeHighlight => ({
    tradeId: trades[index].id,
    symbol: trades[index].stock.symbol,
    realisedPnl: pnl[index],
  })
  const indexOf = (pick: (a: number, b: number) => boolean) =>
    pnl.reduce((best, value, i) => (pick(value, pnl[best]) ? i : best), 0)

  return {
    baseCurrency,
    tradeCount: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: trades.length - wins.length - losses.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : null,
    netPnl: sum(pnl),
    grossProfit,
    grossLoss,
    profitFactor: grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null,
    averageWin: wins.length ? grossProfit / wins.length : null,
    averageLoss: losses.length ? grossLoss / losses.length : null,
    averageHoldingDays: trades.length
      ? sum(trades.map((t) => t.holdingDays)) / trades.length
      : null,
    bestTrade: trades.length ? highlight(indexOf((a, b) => a > b)) : null,
    worstTrade: trades.length ? highlight(indexOf((a, b) => a < b)) : null,
  }
}
