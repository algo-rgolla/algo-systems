/**
 * Exponential moving average, seeded with the simple average of the first `period` values
 * (as AlgoSystems.Indicator does). Entries before the seed are null.
 */
export function ema(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = values.map(() => null)
  if (values.length < period) return result

  const k = 2 / (period + 1)
  let current = values.slice(0, period).reduce((total, v) => total + v, 0) / period
  result[period - 1] = current
  for (let i = period; i < values.length; i++) {
    current = values[i] * k + current * (1 - k)
    result[i] = current
  }
  return result
}
