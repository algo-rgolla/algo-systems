/**
 * Scan identifiers written by the batch jobs (AlgoSystems.Common Constants.Scans).
 * The API identifies scans and strategy portfolios by these strings.
 */
export const SCANS = {
  longBigGainers: 'Scan_LongBigGainers',
  longUnusualVolume: 'Scan_Long_Unusual_Volume',
  longEmaCrossover: 'Scan_Long_EMA_Crossover',
  longMacdCrossover: 'Scan_Long_MACD_Crossover',
  usLongBigGainers: 'Scan_CFD_US_Long_BigGainers',
  usShortBigLosers: 'Scan_CFD_US_Short_BigLoosers',
} as const

export interface ScanDefinition {
  id: string
  label: string
  market: 'ASX' | 'US'
  direction: 'Long' | 'Short'
}

export const SCAN_CATALOG: ScanDefinition[] = [
  { id: SCANS.longBigGainers, label: 'Big Gainers', market: 'ASX', direction: 'Long' },
  { id: SCANS.longUnusualVolume, label: 'Unusual Volume', market: 'ASX', direction: 'Long' },
  { id: SCANS.longEmaCrossover, label: 'EMA Crossover', market: 'ASX', direction: 'Long' },
  { id: SCANS.longMacdCrossover, label: 'MACD Crossover', market: 'ASX', direction: 'Long' },
  { id: SCANS.usLongBigGainers, label: 'US Big Gainers', market: 'US', direction: 'Long' },
  { id: SCANS.usShortBigLosers, label: 'US Big Losers', market: 'US', direction: 'Short' },
]

/** Scans whose signals the batch trades into a simulated portfolio (Constants.AlgoScans). */
export const STRATEGY_SCANS: string[] = [
  SCANS.longBigGainers,
  SCANS.longUnusualVolume,
  SCANS.longEmaCrossover,
]

const byId = new Map(SCAN_CATALOG.map((scan) => [scan.id, scan]))

export function getScan(id: string): ScanDefinition | undefined {
  return byId.get(id)
}

export function scanLabel(id: string): string {
  return byId.get(id)?.label ?? id.replace(/^Scan_/, '').replace(/_/g, ' ')
}
