import { describe, expect, it } from 'vitest'
import { daysBetween } from './dates'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatMultiple,
  formatPercent,
  formatPrice,
  formatQuantity,
  formatTime,
} from './format'

// Intl separates a currency code from the number with a no-break space, which \s matches.
const plain = (text: string) => text.replace(/\s/g, ' ')

describe('formatCurrency', () => {
  it('formats AUD with a symbol and USD with its code', () => {
    expect(formatCurrency(248650)).toBe('$248,650')
    expect(plain(formatCurrency(1234, { currency: 'USD' }))).toBe('USD 1,234')
  })

  it('signs values with + and a true minus sign', () => {
    expect(formatCurrency(28420, { signed: true })).toBe('+$28,420')
    expect(formatCurrency(-213.36, { signed: true, decimals: 2 })).toBe('−$213.36')
    expect(formatCurrency(-213.36)).toBe('−$213')
  })

  it('drops the sign when a value rounds to zero', () => {
    expect(formatCurrency(-0.4, { signed: true })).toBe('$0')
    expect(formatCurrency(0, { signed: true })).toBe('$0')
  })

  it('shows a dash for missing values', () => {
    expect(formatCurrency(null)).toBe('—')
  })
})

describe('formatPercent', () => {
  it('signs by default and rounds to two decimals', () => {
    expect(formatPercent(2.8414)).toBe('+2.84%')
    expect(formatPercent(-0.44)).toBe('−0.44%')
    expect(formatPercent(0)).toBe('0.00%')
    expect(formatPercent(-0.001)).toBe('0.00%')
  })

  it('supports unsigned whole percentages', () => {
    expect(formatPercent(38.49, { signed: false, decimals: 0 })).toBe('38%')
  })
})

describe('formatPrice', () => {
  it('formats with or without a currency', () => {
    expect(formatPrice(182.42)).toBe('182.42')
    expect(formatPrice(45.12, 'AUD')).toBe('$45.12')
    expect(plain(formatPrice(1042.2, 'USD'))).toBe('USD 1,042.20')
  })

  it('keeps a tenth of a cent for prices under $2', () => {
    expect(formatPrice(1.235, 'AUD')).toBe('$1.235')
    expect(formatPrice(1.23, 'AUD')).toBe('$1.23')
  })
})

describe('quantities and multiples', () => {
  it('groups thousands and keeps fractional shares', () => {
    expect(formatQuantity(2500)).toBe('2,500')
    expect(formatQuantity(1.5)).toBe('1.5')
  })

  it('formats ratios with a multiplication sign', () => {
    expect(formatMultiple(3.4)).toBe('3.4×')
  })
})

describe('dates', () => {
  it('formats ISO calendar dates without a timezone shift', () => {
    expect(formatDate('2026-10-23')).toBe('23 Oct 2026')
    expect(formatDate('2026-01-01')).toBe('01 Jan 2026')
  })

  it('shows times in the exchange timezone', () => {
    expect(formatTime('2026-10-23T16:05:00+11:00', 'Australia/Sydney')).toBe('4:05 pm')
    expect(formatTime('2026-10-23T16:05:00-04:00', 'America/New_York')).toBe('4:05 pm')
    expect(formatDateTime('2026-10-23T16:05:00+11:00', 'Australia/Sydney')).toBe(
      '23 Oct 2026, 4:05 pm',
    )
  })

  it('counts calendar days between ISO dates', () => {
    expect(daysBetween('2026-10-02', '2026-10-21')).toBe(19)
    expect(daysBetween('2026-03-27', '2026-03-30')).toBe(3) // Across the end of daylight saving.
  })
})
