import type { CurrencyCode } from '@/shared/formatting/format'

/** Exchange codes as EODHD and the API use them. */
export type Market = 'AU' | 'US'

export interface MarketDefinition {
  code: Market
  label: string
  currency: CurrencyCode
  /** IANA zone of the exchange; scan run times are shown in it. */
  timeZone: string
  /** Upper-case ticker without the exchange suffix. */
  symbolPattern: RegExp
  symbolHint: string
}

export const MARKETS: Record<Market, MarketDefinition> = {
  AU: {
    code: 'AU',
    label: 'ASX',
    currency: 'AUD',
    timeZone: 'Australia/Sydney',
    symbolPattern: /^[A-Z0-9]{3,6}$/,
    symbolHint: '3–6 letters or digits, e.g. BHP',
  },
  US: {
    code: 'US',
    label: 'US',
    currency: 'USD',
    timeZone: 'America/New_York',
    symbolPattern: /^[A-Z]{1,5}(\.[A-Z])?$/,
    symbolHint: '1–5 letters, e.g. NVDA or BRK.B',
  },
}

export function isValidSymbol(market: Market, symbol: string): boolean {
  return MARKETS[market].symbolPattern.test(symbol)
}
