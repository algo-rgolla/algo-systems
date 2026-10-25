import type { Candle } from '@/shared/components/CandlestickChart'
import type { StatusTone } from '@/shared/components/StatusPill'
import { toIsoDate } from '@/shared/formatting/dates'

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

/** 60 weekday candles on a gentle wave, ending 23 Oct 2026. */
export const sampleCandles: Candle[] = (() => {
  const candles: Candle[] = []
  const day = new Date('2026-10-23T00:00:00Z')
  while (candles.length < 60) {
    if (day.getUTCDay() !== 0 && day.getUTCDay() !== 6) {
      const i = 60 - candles.length
      const open = 180 + Math.sin(i / 6) * 8
      const close = open + Math.cos(i / 2) * 2.5
      candles.unshift({
        date: toIsoDate(day),
        open,
        close,
        high: Math.max(open, close) + 1.2,
        low: Math.min(open, close) - 1.2,
      })
    }
    day.setUTCDate(day.getUTCDate() - 1)
  }
  return candles
})()
