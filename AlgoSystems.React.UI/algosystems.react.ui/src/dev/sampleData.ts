import type { StatusTone } from '@/shared/components/StatusPill'

/** Values from the design reference, used only by the theme preview page. */
export interface SampleStock {
  rowKey: string
  symbol: string
  name: string
  price: number
  changePercent: number
  sector: string
  signal: string
  signalTone: StatusTone
}

const stock = (
  symbol: string,
  name: string,
  price: number,
  changePercent: number,
  sector: string,
  signal: string,
  signalTone: StatusTone,
): SampleStock => ({
  rowKey: symbol,
  symbol,
  name,
  price,
  changePercent,
  sector,
  signal,
  signalTone,
})

export const sampleStocks: SampleStock[] = [
  stock('NVDA', 'NVIDIA', 182.42, 2.84, 'Semiconductors', 'Volume surge', 'positive'),
  stock('MSFT', 'Microsoft', 524.18, 0.92, 'Software', 'EMA crossover', 'warn'),
  stock('AVGO', 'Broadcom', 371.22, -0.44, 'Semiconductors', 'Weakening', 'negative'),
  stock('BHP', 'BHP Group', 45.12, 0, 'Materials', 'No signal', 'neutral'),
]

export const sampleAllocation = [
  { sector: 'Semiconductors', percent: 38 },
  { sector: 'Software & cloud', percent: 26 },
  { sector: 'Internet platforms', percent: 18 },
  { sector: 'Other', percent: 18 },
]
