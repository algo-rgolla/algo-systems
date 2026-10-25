import type { ScanType } from './types'

export interface ScanDefinition {
  label: string
  description: string
  /** The id the current API and batch use for the ASX run (AlgoSystems.Common Constants.Scans). */
  apiScanId: string
}

export const SCAN_CATALOG: Record<ScanType, ScanDefinition> = {
  'unusual-volume': {
    label: 'Unusual Volume',
    description: 'Stocks trading well above their average volume on an up day.',
    apiScanId: 'Scan_Long_Unusual_Volume',
  },
  'big-gainers': {
    label: 'Big Gainers',
    description: 'Stocks with the biggest daily gains.',
    apiScanId: 'Scan_LongBigGainers',
  },
  'ema-crossover': {
    label: 'EMA Crossover',
    description: 'Stocks in an uptrend, with EMA 9 above EMA 21 above EMA 63.',
    apiScanId: 'Scan_Long_EMA_Crossover',
  },
}
