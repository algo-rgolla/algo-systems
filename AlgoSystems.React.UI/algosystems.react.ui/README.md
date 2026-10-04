# AlgoSystems UI

Stock screener and portfolio frontend for `AlgoSystems.Core.Api`.

React 19 · TypeScript · Vite · MUI 9 · MUI X Data Grid & Charts · TanStack Query 5 · React Router 7

## Running

```bash
# 1. API (from the repo root) — serves http://localhost:5239
dotnet run --project AlgoSystems.Core.Api --launch-profile http

# 2. UI — serves http://localhost:5173 and proxies /api to the API
npm install
npm run dev
```

| Script             | Purpose                                       |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Dev server with HMR                           |
| `npm run build`    | Type-check and production build to `dist/`    |
| `npm run check`    | Type-check + ESLint + Prettier check (no fix) |
| `npm run lint:fix` | ESLint with autofix                           |
| `npm run format`   | Prettier write                                |

Configuration lives in `.env.local` (see `.env.example`). In development leave
`VITE_API_BASE_URL` empty so calls go through the Vite proxy; set it to the API origin for
production builds. Port 5173 is fixed because it is the origin the API's CORS policy allows.

## Structure

```
src/
  app/          Composition root: providers, theme, router, layout. Nothing imports from here.
  api/          HTTP client and wire DTOs that mirror the C# BusinessObjects.
  features/     One folder per business area. Owns its query hooks, components and pages.
    stocks/     Shared stock/position domain: DTO → model mapping, columns, scan catalog, P&L maths.
    screener/   Scan results       dashboard/   Summary of the others
    watchlist/  Watchlist          portfolio/   Simulated strategy portfolios
    trades/     Manually recorded trades (AlgoPortfolio)
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
  scan and strategy are search params (`/screener?scan=…`), so views are linkable. There is no
  global client-state store, and none is needed yet.
- **Financial colour is semantic.** Use `SignedValue` / `theme.palette.market.{up,down,flat}` for
  P&L and price changes, never `success` / `error`.

## Decisions deferred

- **Authentication.** The API's Firebase middleware doesn't verify tokens yet.
  `setAccessTokenProvider` in `api/client/httpClient.ts` is the hook point for attaching a Bearer
  token once it does.
- **Light theme.** The theme is dark-only. Every colour comes from `app/theme/theme.ts`, so adding
  a light scheme won't require changing components.
- **Price charts.** The API has no OHLC/history endpoint. MUI X Charts covers equity curves. A
  candlestick view would justify adding TradingView `lightweight-charts`.
- **Generated API types.** The DTOs in `api/types/dtos.ts` are written by hand. If the API grows,
  generate them from the Swagger document (`openapi-typescript`) instead.
- **Tests.** Vitest + Testing Library. Start with `shared/formatting` and `features/stocks`, which
  hold the pure logic.
