import { describe, expect, it } from 'vitest'
import type { Stock } from '@/features/stocks/types'
import {
  estimatedCost,
  initialAddHoldingValues,
  toAddHoldingRequest,
  validateAddHolding,
  type AddHoldingFormValues,
} from './addHoldingValidation'

const nvda: Stock = {
  key: 'NVDA.US',
  symbol: 'NVDA',
  market: 'US',
  name: 'NVIDIA',
  sector: 'Semiconductors',
  currency: 'USD',
}

const today = '2026-10-26'
const context = { heldKeys: new Set<Stock['key']>(), today } as const

const valid = (overrides: Partial<AddHoldingFormValues> = {}): AddHoldingFormValues => ({
  ...initialAddHoldingValues('AUD', today),
  stock: nvda,
  quantity: '10',
  price: '150.25',
  ...overrides,
})

describe('validateAddHolding', () => {
  it('starts with the portfolio currency, today and zero fees', () => {
    expect(initialAddHoldingValues('AUD', today)).toMatchObject({
      currency: 'AUD',
      purchaseDate: today,
      fees: '0',
      stock: null,
    })
  })

  it('accepts a complete form', () => {
    expect(validateAddHolding(valid(), context)).toEqual({})
  })

  it('requires a stock, quantity and price', () => {
    const errors = validateAddHolding(initialAddHoldingValues('AUD', today), context)
    expect(errors.stock).toBe('Choose a stock from the list.')
    expect(errors.quantity).toBe('Enter the quantity.')
    expect(errors.price).toBe('Enter the average purchase price.')
  })

  it('rejects zero, negative and non-numeric amounts', () => {
    expect(validateAddHolding(valid({ quantity: '0' }), context).quantity).toMatch(/more than 0/)
    expect(validateAddHolding(valid({ price: '-3' }), context).price).toMatch(/more than 0/)
    expect(validateAddHolding(valid({ quantity: 'ten' }), context).quantity).toMatch(/number/)
    expect(validateAddHolding(valid({ price: '1.23456' }), context).price).toMatch(/decimal/)
    expect(validateAddHolding(valid({ fees: '-1' }), context).fees).toMatch(/negative/)
  })

  it('accepts fractional shares and thousands separators', () => {
    expect(validateAddHolding(valid({ quantity: '0.5', price: '1,042.20' }), context)).toEqual({})
  })

  it('rejects future and malformed purchase dates', () => {
    expect(validateAddHolding(valid({ purchaseDate: '2026-10-27' }), context).purchaseDate).toMatch(
      /future/,
    )
    expect(validateAddHolding(valid({ purchaseDate: '' }), context).purchaseDate).toBeDefined()
  })

  it('rejects a stock that is already held (the duplicate policy)', () => {
    const errors = validateAddHolding(valid(), { heldKeys: new Set(['NVDA.US']), today })
    expect(errors.stock).toBe(
      'You already hold NVDA. Each stock can only be held once in this portfolio.',
    )
  })

  it('limits notes to 500 characters', () => {
    expect(validateAddHolding(valid({ note: 'x'.repeat(501) }), context).note).toBeDefined()
    expect(validateAddHolding(valid({ note: 'x'.repeat(500) }), context).note).toBeUndefined()
  })
})

describe('estimatedCost and the request', () => {
  it('is quantity × price + fees', () => {
    expect(estimatedCost(valid({ fees: '9.95' }))).toBeCloseTo(10 * 150.25 + 9.95, 10)
    expect(estimatedCost(valid({ fees: '' }))).toBeCloseTo(1502.5, 10)
    expect(estimatedCost(valid({ quantity: '' }))).toBeNull()
  })

  it('builds a typed request with a trimmed note', () => {
    expect(toAddHoldingRequest(valid({ fees: '9.95', note: '  Long-term  ' }))).toEqual({
      key: 'NVDA.US',
      quantity: 10,
      price: 150.25,
      fees: 9.95,
      currency: 'AUD',
      purchaseDate: today,
      note: 'Long-term',
    })
    expect(toAddHoldingRequest(valid({ note: '   ' })).note).toBeNull()
  })
})
