import type { StockRow } from './model'

export interface ClosedPositionSummary {
  trades: number
  wins: number
  losses: number
  /** Percentage of closed trades with a positive P/L, or null with no trades. */
  winRate: number | null
  netProfitLoss: number
  averageWin: number | null
  averageLoss: number | null
}

export function summariseClosedPositions(rows: StockRow[]): ClosedPositionSummary {
  const pnl = rows.map((r) => r.profitLoss).filter((v): v is number => v != null)
  const wins = pnl.filter((v) => v > 0)
  const losses = pnl.filter((v) => v < 0)
  const sum = (values: number[]) => values.reduce((total, v) => total + v, 0)

  return {
    trades: pnl.length,
    wins: wins.length,
    losses: losses.length,
    winRate: pnl.length ? (wins.length / pnl.length) * 100 : null,
    netProfitLoss: sum(pnl),
    averageWin: wins.length ? sum(wins) / wins.length : null,
    averageLoss: losses.length ? sum(losses) / losses.length : null,
  }
}

export function totalProfitLoss(rows: StockRow[]): number {
  return rows.reduce((total, r) => total + (r.profitLoss ?? 0), 0)
}

export interface EquityPoint {
  date: Date
  cumulative: number
}

/** Cumulative realised P/L by close date (one point per day). */
export function equityCurve(closed: StockRow[]): EquityPoint[] {
  const byDay = new Map<number, number>()
  for (const row of closed) {
    if (!row.closeDate || row.profitLoss == null) continue
    const day = row.closeDate.getTime()
    byDay.set(day, (byDay.get(day) ?? 0) + row.profitLoss)
  }

  let cumulative = 0
  return [...byDay.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, pnl]) => {
      cumulative += pnl
      return { date: new Date(day), cumulative }
    })
}
