# AlgoSystems UI

Stock screener and portfolio frontend for AlgoSystems. **It currently runs entirely on deterministic
mock data (`src/demo/`); no page calls the API**, and every price, scan and portfolio figure is
simulated and labelled as such.

React 19 · TypeScript · Vite · MUI 9 · MUI X Data Grid & Charts · TanStack Query 5 · React Router 7

## Running

```bash
npm install
npm run dev   # http://localhost:5173; runs on mock data, no API needed
```

| Script             | Purpose                                      |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Dev server with HMR                          |
| `npm run build`    | Type-check and production build to `dist/`   |
| `npm run check`    | Type-check + ESLint + Prettier check + tests |
| `npm run test`     | Vitest (formatting, calculations, demo data) |
| `npm run lint:fix` | ESLint with autofix                          |
| `npm run format`   | Prettier write                               |

Configuration lives in `.env.local` (see `.env.example`). In development leave
`VITE_API_BASE_URL` empty so calls go through the Vite proxy; set it to the API origin for
production builds. Port 5173 is fixed because it is the origin the API's CORS policy allows.

### Demo data

`src/demo/data/` holds the demo data and `src/demo/services.ts` the async functions every query
hook calls. Add `?demoFail=<area>` to a page URL (`scans`, `market`, `portfolio`, `stocks`, or
`all`) to see its error state. Holdings added on the Portfolio page last until the page reloads.

## Structure

```
src/
  app/          Composition root: providers, theme, router, layout. Nothing imports from here.
  api/          HTTP client and wire DTOs that mirror the C# BusinessObjects.
  features/     One folder per business area. Owns its query hooks, components and pages.
    stocks/     Shared stock/position domain: DTO → model mapping, columns, scan catalog, P&L maths.
    dashboard/          Today's scans and market data
    portfolio/          Holdings you enter manually (AlgoPortfolio)
    portfolio-history/  Closed trades and their results
    stock-scans/        Unusual Volume, Big Gainers and EMA Crossover results
    watchlist/          Watched stocks with price charts
  demo/         The data source: deterministic demo data (data/) and async services.
  shared/       Business-agnostic UI, hooks and formatting. Must not import from features/.
```

### Rules

- **Pages never call `fetch`.** Each feature exposes TanStack Query hooks in its `api.ts`;
  ESLint blocks `fetch` outside `src/api/client`.
- **DTOs stop at the API boundary.** The API sends numbers and dates as formatted strings
  (`"1.20"`, `"161.21M"`, `"02-01-2026"`). `features/stocks/model.ts` converts them to typed
  `StockRow`s in each query's `select`, so components only see numbers and `Date`s.
- **Feature dependencies flow one way.** Features may import from `features/stocks` (the shared
  domain). `dashboard` composes other features' exported hooks. Other features don't import each
  other.
- **Server state lives in TanStack Query; UI state lives in the URL or local state.** The selected
  scan is a search param (`/scans?scan=…`), so views are linkable. There is no
  global client-state store, and none is needed yet.
- **Financial colour is semantic.** Use `SignedValue` / `theme.palette.market.{up,down,flat}` for
  P&L and price changes, never `success` / `error`.

## Verification checklist: Stock Scans

Automated: `src/features/stock-scans/filters.test.ts` (search, filters, options, summaries,
crossover direction) and `src/demo/data/demoData.test.ts` (scan membership, ranking, metrics).
Manually, on `/scans`:

1. Each tile (Unusual Volume, Big Gainers, EMA Crossover) sets `?scan=`, gets the selected style,
   and changes the columns, the strip counts and the Sector/Signal filter options.
2. Search matches the start of a symbol or any part of a company name (`pl` finds PLTR and PLS).
3. Market, Sector, Signal and Minimum score combine; the strip shows "N of M shown".
4. Filters that match nothing show "No results match these filters" with Clear filters.
5. Switching scans resets the filters.
6. Clicking a column header sorts ascending, then descending; the pager pages 10 rows at a time.
7. `?demoFail=scans` shows the error state with Retry; on a phone the grid scrolls sideways
   inside its panel and the pager arrows stay visible.

## Decisions deferred

- **Authentication.** The API's Firebase middleware doesn't verify tokens yet.
  `setAccessTokenProvider` in `api/client/httpClient.ts` is the hook point for attaching a Bearer
  token once it does.
- **Light theme.** The theme is dark-only. Every colour comes from `app/theme/palette.ts`, so adding
  a light scheme won't require changing components.
- **Generated API types.** The DTOs in `api/types/dtos.ts` are written by hand. If the API grows,
  generate them from the Swagger document (`openapi-typescript`) instead.
- **Component tests.** Vitest covers the pure logic; add Testing Library for component tests.
