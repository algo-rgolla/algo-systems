/** TradingView's market quotes widget, as embedded by the design reference. */
export const MARKET_QUOTES_SCRIPT =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-quotes.js'

/** The reference's 400px widget box less the 32px attribution row below it. */
export const MARKET_QUOTES_HEIGHT = 368

/**
 * The reference's widget settings. Exchange-licensed feeds (CME/COMEX/NYMEX futures, ASX) don't
 * display in free widgets, so those markets use CFD symbols that track them.
 */
export function marketQuotesConfig(backgroundColor: string): Record<string, unknown> {
  return {
    width: '100%',
    height: MARKET_QUOTES_HEIGHT,
    colorTheme: 'dark',
    isTransparent: false,
    backgroundColor,
    showSymbolLogo: true,
    locale: 'en',
    symbolsGroups: [
      {
        name: 'Indices',
        symbols: [
          { name: 'FOREXCOM:SPXUSD', displayName: 'S&P 500' },
          { name: 'FOREXCOM:NSXUSD', displayName: 'US Tech 100' },
          { name: 'OANDA:AU200AUD', displayName: 'ASX 200' },
          { name: 'FOREXCOM:DJI', displayName: 'Dow Jones' },
        ],
      },
      {
        name: 'Futures',
        symbols: [
          { name: 'TVC:GOLD', displayName: 'Gold' },
          { name: 'TVC:USOIL', displayName: 'WTI Crude Oil' },
        ],
      },
    ],
  }
}
