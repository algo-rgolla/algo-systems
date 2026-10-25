import type { Stock, StockKey } from '@/features/stocks/types'
import { isIsoDate, type IsoDate } from '@/shared/formatting/dates'
import type { CurrencyCode } from '@/shared/formatting/format'
import { parseNumber } from '@/shared/formatting/parse'
import { purchaseCost } from './calculations'
import type { AddHoldingRequest } from './types'

/** The Add holding form as typed: numbers stay text until they validate. */
export interface AddHoldingFormValues {
  stock: Stock | null
  quantity: string
  price: string
  purchaseDate: string
  fees: string
  currency: CurrencyCode
  note: string
}

export type AddHoldingField = keyof AddHoldingFormValues

export type AddHoldingErrors = Partial<Record<AddHoldingField, string>>

export const MAX_NOTE_LENGTH = 500
const MAX_DECIMALS = 4
const EARLIEST_PURCHASE: IsoDate = '1990-01-01'

export function initialAddHoldingValues(
  currency: CurrencyCode,
  today: IsoDate,
): AddHoldingFormValues {
  return {
    stock: null,
    quantity: '',
    price: '',
    purchaseDate: today,
    fees: '0',
    currency,
    note: '',
  }
}

function decimals(text: string) {
  return text.trim().split('.')[1]?.length ?? 0
}

/** A positive amount, or a message saying why the text isn't one. */
function positiveAmount(text: string, label: string): number | string {
  if (text.trim() === '') return `Enter the ${label}.`
  const value = parseNumber(text)
  if (value == null) return `The ${label} must be a number.`
  if (value <= 0) return `The ${label} must be more than 0.`
  if (decimals(text) > MAX_DECIMALS) return `Use at most ${MAX_DECIMALS} decimal places.`
  if (value > 1e9) return `The ${label} is too large.`
  return value
}

function parseFees(text: string): number | null {
  return text.trim() === '' ? 0 : parseNumber(text)
}

interface ValidationContext {
  /** Stocks already in the portfolio. */
  heldKeys: ReadonlySet<StockKey>
  today: IsoDate
}

/**
 * Duplicate policy: each stock can be held once. Adding a stock that is already held is
 * rejected with a message, rather than silently merged into the existing holding.
 */
export function validateAddHolding(
  values: AddHoldingFormValues,
  { heldKeys, today }: ValidationContext,
): AddHoldingErrors {
  const errors: AddHoldingErrors = {}

  if (!values.stock) {
    errors.stock = 'Choose a stock from the list.'
  } else if (heldKeys.has(values.stock.key)) {
    errors.stock = `You already hold ${values.stock.symbol}. Each stock can only be held once in this portfolio.`
  }

  const quantity = positiveAmount(values.quantity, 'quantity')
  if (typeof quantity === 'string') errors.quantity = quantity

  const price = positiveAmount(values.price, 'average purchase price')
  if (typeof price === 'string') errors.price = price

  const fees = parseFees(values.fees)
  if (fees == null) errors.fees = 'Fees must be a number.'
  else if (fees < 0) errors.fees = 'Fees can’t be negative.'
  else if (decimals(values.fees) > 2) errors.fees = 'Use at most 2 decimal places.'

  if (!isIsoDate(values.purchaseDate)) {
    errors.purchaseDate = 'Enter the purchase date.'
  } else if (values.purchaseDate > today) {
    errors.purchaseDate = 'The purchase date can’t be in the future.'
  } else if (values.purchaseDate < EARLIEST_PURCHASE) {
    errors.purchaseDate = 'Check the purchase date.'
  }

  if (values.note.length > MAX_NOTE_LENGTH) {
    errors.note = `Keep notes to ${MAX_NOTE_LENGTH} characters or fewer.`
  }

  return errors
}

/** quantity × price + fees while those inputs are valid, else null. */
export function estimatedCost(values: AddHoldingFormValues): number | null {
  const quantity = parseNumber(values.quantity)
  const price = parseNumber(values.price)
  const fees = parseFees(values.fees)
  if (quantity == null || price == null || fees == null) return null
  if (quantity <= 0 || price <= 0 || fees < 0) return null
  return purchaseCost(quantity, price, fees)
}

/** The request for values that passed `validateAddHolding`. */
export function toAddHoldingRequest(values: AddHoldingFormValues): AddHoldingRequest {
  if (!values.stock) throw new Error('A stock is required.')
  const note = values.note.trim()
  return {
    key: values.stock.key,
    quantity: parseNumber(values.quantity) ?? 0,
    price: parseNumber(values.price) ?? 0,
    fees: parseFees(values.fees) ?? 0,
    currency: values.currency,
    purchaseDate: values.purchaseDate as IsoDate,
    note: note === '' ? null : note,
  }
}
