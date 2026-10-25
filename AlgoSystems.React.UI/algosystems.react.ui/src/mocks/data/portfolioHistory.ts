import { toClosedTrade, type ClosedTradeRecord } from '@/features/portfolio-history/calculations'
import type { ClosedTrade } from '@/features/portfolio-history/types'
import type { PositionSide, StockKey } from '@/features/stocks/types'
import type { IsoDate } from '@/shared/formatting/dates'
import { demoStock } from './stocks'

const trade = (
  id: string,
  key: StockKey,
  side: PositionSide,
  quantity: number,
  entryDate: IsoDate,
  exitDate: IsoDate,
  entryPrice: number,
  exitPrice: number,
): ClosedTradeRecord => ({
  id,
  stock: demoStock(key),
  side,
  quantity,
  entryDate,
  exitDate,
  entryPrice,
  exitPrice,
})

/**
 * Closed trades, newest exit first. The first eight are the design reference's trades (the
 * reference's Saturday exits for PANW and ASML moved to the Friday before). P/L, return,
 * holding days and outcome are derived from these fields by `toClosedTrade`.
 */
const RECORDS: ClosedTradeRecord[] = [
  trade('t01', 'NVDA.US', 'long', 25, '2026-10-02', '2026-10-21', 168.4, 182.42),
  trade('t02', 'MSFT.US', 'long', 10, '2026-09-18', '2026-10-16', 492.0, 521.3),
  trade('t03', 'AVGO.US', 'long', 12, '2026-09-29', '2026-10-14', 389.0, 371.22),
  trade('t04', 'TSM.US', 'long', 15, '2026-09-04', '2026-10-09', 274.5, 298.5),
  trade('t05', 'GOOGL.US', 'long', 20, '2026-09-22', '2026-10-07', 254.2, 248.7),
  trade('t06', 'AMAT.US', 'long', 8, '2026-08-28', '2026-10-01', 205.0, 226.1),
  trade('t07', 'PANW.US', 'long', 18, '2026-09-11', '2026-09-25', 214.0, 205.82),
  trade('t08', 'ASML.US', 'long', 4, '2026-08-05', '2026-09-18', 988.0, 1042.2),

  trade('t40', 'REA.AU', 'long', 25, '2026-10-08', '2026-10-23', 229.4, 236.8),
  trade('t39', 'MIN.AU', 'long', 200, '2026-10-05', '2026-10-22', 45.8, 43.1),
  trade('t38', 'UBER.US', 'long', 80, '2026-09-28', '2026-10-20', 92.1, 95.04),
  trade('t37', 'RIO.AU', 'long', 70, '2026-09-21', '2026-10-16', 121.6, 126.95),
  trade('t36', 'WES.AU', 'long', 110, '2026-09-14', '2026-10-13', 82.4, 85.9),
  trade('t34', 'ALL.AU', 'long', 140, '2026-08-31', '2026-10-06', 63.2, 61.75),
  trade('t35', 'NFLX.US', 'short', 5, '2026-09-07', '2026-09-24', 1180.0, 1214.6),
  trade('t32', 'COST.US', 'long', 6, '2026-08-17', '2026-09-23', 890.0, 905.5),
  trade('t33', 'EVN.AU', 'long', 1200, '2026-08-24', '2026-09-15', 8.65, 9.42),
  trade('t30', 'NST.AU', 'long', 450, '2026-08-03', '2026-09-08', 19.85, 21.6),
  trade('t31', 'AMZN.US', 'long', 30, '2026-08-10', '2026-08-28', 228.3, 219.6),
  trade('t29', 'IEL.AU', 'short', 1500, '2026-07-27', '2026-08-25', 5.4, 4.62),
  trade('t28', 'META.US', 'long', 12, '2026-07-20', '2026-08-14', 690.4, 702.1),
  trade('t26', 'MQG.AU', 'long', 40, '2026-07-06', '2026-08-11', 214.5, 224.1),
  trade('t27', 'ZIP.AU', 'long', 2500, '2026-07-13', '2026-07-31', 2.95, 3.38),
  trade('t25', 'WDS.AU', 'long', 500, '2026-06-29', '2026-07-28', 25.8, 24.3),
  trade('t23', 'GMG.AU', 'long', 300, '2026-06-15', '2026-07-21', 33.1, 34.75),
  trade('t22', 'CRWD.US', 'long', 14, '2026-06-08', '2026-07-15', 431.0, 455.6),
  trade('t24', 'SOFI.US', 'long', 400, '2026-06-22', '2026-07-10', 18.9, 21.45),
  trade('t20', 'NXT.AU', 'long', 600, '2026-05-25', '2026-06-30', 15.9, 16.85),
  trade('t21', 'LYC.AU', 'long', 900, '2026-06-02', '2026-06-24', 10.2, 9.36),
  trade('t18', 'TLS.AU', 'long', 2500, '2026-05-11', '2026-06-16', 4.85, 4.85),
  trade('t17', 'XRO.AU', 'long', 70, '2026-05-04', '2026-06-10', 168.0, 179.55),
  trade('t19', 'TSLA.US', 'short', 15, '2026-05-18', '2026-06-05', 412.0, 388.4),
  trade('t16', 'CSL.AU', 'long', 50, '2026-04-20', '2026-05-29', 262.1, 251.4),
  trade('t15', 'PLTR.US', 'long', 60, '2026-04-14', '2026-05-20', 118.4, 136.9),
  trade('t13', 'WTC.AU', 'long', 120, '2026-04-01', '2026-05-06', 104.3, 112.8),
  trade('t14', 'AMD.US', 'long', 40, '2026-04-07', '2026-04-29', 148.6, 139.75),
  trade('t12', 'PLS.AU', 'long', 3000, '2026-03-23', '2026-04-21', 2.41, 2.97),
  trade('t10', 'CBA.AU', 'long', 60, '2026-03-09', '2026-04-14', 158.2, 163.9),
  trade('t11', 'FMG.AU', 'long', 800, '2026-03-16', '2026-04-02', 19.4, 18.62),
  trade('t09', 'BHP.AU', 'long', 400, '2026-03-02', '2026-03-27', 41.8, 44.15),
]

export const demoClosedTrades: ClosedTrade[] = RECORDS.map(toClosedTrade).sort(
  (a, b) => b.exitDate.localeCompare(a.exitDate) || a.id.localeCompare(b.id),
)
