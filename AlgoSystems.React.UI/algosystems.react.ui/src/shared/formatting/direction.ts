export type Direction = 'up' | 'down' | 'flat'

/** Direction of a signed value. Zero and missing values are flat. */
export function directionOf(value: number | null | undefined): Direction {
  if (value == null || value === 0) return 'flat'
  return value > 0 ? 'up' : 'down'
}
