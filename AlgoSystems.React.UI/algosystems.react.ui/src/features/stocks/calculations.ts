import type { PositionSide } from './types'

/** Rounds a money amount to cents. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/** +1 for long positions, −1 for short: profits move against the price for shorts. */
export function sideSign(side: PositionSide): 1 | -1 {
  return side === 'long' ? 1 : -1
}

/** Change from the previous close, as the quote fields `change` and `changePercent`. */
export function priceChange(price: number, previousClose: number) {
  const change = roundMoney(price - previousClose)
  return { change, changePercent: previousClose === 0 ? 0 : (change / previousClose) * 100 }
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
