# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

AlgoSystems is a stock screener / algorithmic portfolio system for the ASX (exchange code `AU`), with US support in progress. Market data comes from EOD Historical Data (eodhd.com). Nightly batch jobs download symbols and fundamentals into SQL Server, run scans, and manage simulated portfolios; a .NET Web API serves the results to a React frontend.

## Commands

The .NET solution is `AlgoSystems.sln` (mostly net8.0; developed in Visual Studio 2022).

```bash
dotnet build AlgoSystems.sln
dotnet run --project AlgoSystems.Core.Api               # Swagger at /swagger (root redirects there)
dotnet test AlgoSystems.Indicator.Test                  # NUnit; the only suite with active tests
dotnet test AlgoSystems.Indicator.Test --filter "FullyQualifiedName~<TestName>"
```

`AlgoSystems.Test` (NUnit, business logic) exists, but its tests are commented out and need a real database.

React UI (`AlgoSystems.React.UI/algosystems.react.ui`). Run the API first with `dotnet run --project AlgoSystems.Core.Api --launch-profile http` (port 5239), because the dev server proxies `/api` to it:

```bash
npm run dev       # Vite dev server on http://localhost:5173 (strictPort; it's the origin CORS allows)
npm run build     # tsc -b && vite build
npm run check     # typecheck + eslint + prettier --check + vitest; run before calling a change done
npm run test      # vitest run (formatting, calculations, demo-data consistency)
npm run lint:fix  # eslint --fix
npm run format    # prettier --write
```

EF Core entities are database-first. To regenerate them, set the startup project and run `Scaffold-DbContext "<conn>" Microsoft.EntityFrameworkCore.SqlServer -OutputDir Models -Force` in the Package Manager Console. The `Migrations/` folder in `AlgoSystems.Domain.Entities` is from 2022 and is out of date. New tables are scripted by hand (see `AlgoSchemaScripts.txt`, which covers the `[Code]` schema lookup tables).

## Architecture

Active projects (the ones in `AlgoSystems.sln`) and how they depend on each other:

- **AlgoSystems.Domain.Entities**: EF Core `AlgoSystemsContext` plus the scaffolded models. The main tables are `EodhdSymbols`, `EodhdSymbolDetails` (a daily snapshot per symbol with price, EMA, volume averages and market cap; most scans query this), `ProductScanResults`, `ProductPortfolios`, `AlgoPortfolios` and `Watchlists`. Schemas are `dbo`, `App` and `Code`.
- **Repository**: thin repositories (`LookupRepository`, `WatchlistRepository`, base/generic repositories) over the context.
- **AlgoSystems.Application**: the project file is `AlgoSystems.BusinessLogic.csproj`, but the namespaces are `AlgoSystems.Application.*` (and `AlgoSystems.BusinessLogic.Common` for `Common/`). It holds all business logic. Each interface in `Interfaces/` has its implementation in `Services/`. Key services:
  - `EodhdDownloadService`: pulls exchange symbols and symbol details from EODHD and clears the daily scan and watchlist data.
  - `ScanBusinessLogic`: runs the daily product scans (`ProcessEodProductScans`) and writes them to `ProductScanResult`.
  - `EodhdPortfolioService` / `PortfolioService`: manage the simulated long and algo portfolios (`ManageLongPortfolio`, `ManageAlgoPortfolio`).
  - `Search*`, `Watchlist*`, `PortfolioHistory*`: read paths used by the API.
- **BusinessObjects** (`AlgoSystems.BusinessObjects`): DTOs and view models returned by the API.
- **AlgoSystems.Common**: shared enums, constants, helpers, and `IUserContext`.
- **AlgoSystems.Indicator**: technical indicator calculators (EMA, RSI, MACD, ATR, and others) built on `IndicatorCalculatorBase` / `Ohlc`.
- **EODHistoricalData.Wrapper-master/EODHistoricalData.Wrapper**: a vendored netstandard2.0 EODHD API client.

### Entry points

- **AlgoSystems.Core.Api**: the ASP.NET Core Web API (controllers for LongScan, Portfolio, AlgoPortfolio, PortfolioHistory, Product, Search, WatchList). Services are registered in `Common/IoCExtensions.cs`, and every new service or repository must be added there. On startup it loads `serviceAccountKey.json` from the working directory for Firebase auth. `FirebaseAuthenticationMiddleware` exists, but token verification is currently commented out. CORS origins come from `AllowedOrigins` in appsettings, and startup throws if that setting is missing.
- **Batch console apps** (in the `AlgoBatches` solution folders). Each one builds its own `ServiceCollection` in `Program.ConfigureServices`, reads `ConnectionStrings:DefaultConnection` from a local `appsettings.json`, logs with Serilog to rolling files, and uses `DummyHttpUserContext` in place of the HTTP user context. A new service the batches need must be registered in each of their `Program.cs` files as well as in the API's `IoCExtensions`.
  - `Algo.DownloadStockDetails` downloads AU symbols and details, then clears scan and watchlist data.
  - `Algo.ScanMarkets` runs the daily scans, then manages the portfolios.
  - `Algo.ScanMarkets.US` and `AlgoSystems.US` (`Algo.DownloadStockDetails.US.csproj`) are the US equivalents.
  - `AlgoEodhd.Batch` is an older combined batch.
- **Algo.Quartz.WinService**: a Quartz.NET Windows service intended to schedule the batches. Its jobs are currently stubs that only log. In practice the batches run from Windows Task Scheduler.

### Frontend

`AlgoSystems.React.UI/algosystems.react.ui` is the current UI, built from the plan in `Ai_prompt_implementation.txt`. Its `README.md` has the same rules in more detail.

**Stack:** React 19, TypeScript 6 (strict, `verbatimModuleSyntax`, so use `import type`), Vite 8, MUI 9 with Emotion, MUI X Data Grid and MUI X Charts 9, TanStack Query 5, React Router 7 (data router, imported from `react-router`), Inter via `@fontsource-variable/inter`, and MSW 3 for demo data. ESLint 10 uses a flat config, and Prettier is set to no semicolons, single quotes, trailing commas and a print width of 100. Tests use Vitest (`*.test.ts` next to the code, node environment); add Testing Library when component tests are needed.

**Layout** (`src/`, imported through the `@/` alias):

- `app/` is the composition root: `App.tsx`, `providers/` (AppProviders, `queryClient`), `theme/` (`palette.ts` design tokens and palette augmentation, `theme.ts`), `router/router.tsx`, and `layout/` (AppLayout, TopBar, Sidebar, MobileNavigation, `dimensions.ts`, and `navigation.ts` `NAV_ITEMS`). Nothing imports from `app/`.
- `api/client/httpClient.ts` is the only place that calls `fetch`; ESLint's `no-restricted-globals` enforces this. It throws `ApiError(status, message)` and has `setAccessTokenProvider` as the hook point for auth. `api/types/dtos.ts` holds hand-written wire DTOs that mirror the C# `BusinessObjects`.
- `features/<feature>/` (`dashboard`, `portfolio` (manually entered trades), `portfolio-history`, `stock-scans`, `watchlist`) each own an `api.ts` with query hooks, plus the feature's components and a `<Name>Page.tsx` with a **default export**. `features/stocks/` is the shared domain: `model.ts` (DTO to `StockRow`), `columns.tsx` (reusable `stockColumns`), `scans.ts` (the `SCANS` ids, which match `AlgoSystems.Common` `Constants.Scans`), `markets.ts` (`Market = 'AU' | 'US'`, currency and ticker rules), `positions.ts` (P&L maths) and `EquityCurve`. The automatic per-scan strategy portfolios (`/api/Portfolio`) have no page for now.
- `shared/` is business-agnostic: `components/` (PageHeader, PageContent/SplitLayout, Panel, PanelLink, StatStrip/StatCell, MetricRow, ProgressBar, StatusPill, SignedValue, TwoLineCell, DataTable, EmptyState, LoadingState, ErrorState, ConfirmDialog, ResponsiveGrid, PagePlaceholder), `formatting/` (`format.ts`, `parse.ts`, `direction.ts`), `hooks/` and `notifications/` (`notify.success/error`). `shared/` must not import from `features/`.

**Conventions:**

- **Data access:** for each feature, `api.ts` exports a query-key factory (`watchlistKeys = { all: [...] as const, ... }`) and `useX` / `useXMutation` hooks. Pass `signal` from `queryFn` into `httpClient`, map DTOs in `select` (for example `select: toStockRows`), and have mutations invalidate their feature's keys in `onSettled`. Mutation errors are shown globally by the `MutationCache` toast, so don't add per-call error toasts. Queries use `staleTime` 5 min, no refetch on focus, and no retry on 4xx.
- **DTOs stop at the boundary.** The API sends numbers and dates as formatted strings (`"1.20"`, `"161.21M"`, `"02-01-2026"`). Convert them with `shared/formatting/parse.ts` in the feature's model mapping, so components only see `number | null` and `Date | null`. Display values with `format.ts` helpers.
- **Feature dependencies flow one way.** Any feature may import from `features/stocks`. `dashboard` may compose other features' hooks. Other features don't import each other.
- **State:** server state lives in TanStack Query. UI state that should be linkable, such as the selected scan, goes in URL search params (`/scans?scan=…`). Everything else is local state. There is no global store.
- **Routing:** add a route as a lazy entry in `router.tsx` (`lazy: page(() => import('@/features/x/XPage'))`) and add a `NAV_ITEMS` entry. Pages are code-split so the grid and chart libraries load only where they are used.
- **UI:** the design reference is `Design/algo_ui_design.html`. The theme is dark-only (14px base, 13px on phones, tabular numerals), and every colour comes from `palette.ts` tokens. Breakpoints are custom: `sm` 381, `md` 701 (below it is the phone layout with bottom navigation), `lg` 1101, `xl` 1600. Cards use `<Paper variant="panel">`. Style with the MUI `sx` prop and theme palette paths, not hard-coded colours or `styled()`. Import MUI components per path (`@mui/material/Box`). Every table uses `shared/components/DataTable` (a DataGrid wrapper, styled by the theme's `MuiDataGrid` overrides, placed inside a `Panel`; it fits its rows unless given a `height`), with `getRowId={(row) => row.rowKey}`, because API ids are not unique across lists. Pages follow the pattern `PageHeader`, then `ErrorState` (with retry) or the content, with loading passed to the grid or panel. Destructive actions go through `ConfirmDialog` with `useConfirmTarget`.
- **Theme preview:** in dev, `/dev/theme` (`src/dev/ThemePreviewPage.tsx`, not in production builds) renders every shared component. Add new shared components to it.
- **Accessibility:** focus rings come from the theme (`:focus-visible` and `.Mui-focusVisible`), so don't remove outlines in components. The layout has a skip link to `#main-content`.
- **Financial colour is semantic.** Show P&L and price changes with `SignedValue` or `theme.palette.market.{up,down,flat}`, never `success` or `error`. Status pills use `StatusPill` tones (`palette.signal`). Negative numbers display with U+2212 (−).
- **Domain types:** each feature has `types.ts` (numbers, ISO date strings, `CurrencyCode`) and pure `calculations.ts`; shared stock, quote, market and FX types live in `features/stocks`, and list paging/sorting/filtering types in `api/types/query.ts`. For endpoints that don't exist yet, these types are the proposed wire contract. Derived figures (P/L, returns, summaries, allocation) are always calculated, never stored.
- **Demo data:** `VITE_USE_DEMO_DATA=true` starts a Mock Service Worker. `src/mocks/data/<feature>.ts` holds deterministic demo data (real tickers, simulated prices as of 23 Oct 2026, fixed AUD/USD rate), all derived from one stock universe in `mocks/data/stocks.ts`; `mocks/handlers/<feature>.ts` serve it at the endpoint paths. Demo data never goes in components. `mocks/data/demoData.test.ts` recomputes every derived figure, so keep it passing when changing data. The top bar shows a "Demo data" badge whenever `DEMO_MODE` (`shared/config.ts`) is on.
- **Formatting:** `format.ts` has `formatPrice` (optional currency), `formatCurrency` (`currency`, `signed`, `decimals`), `formatPercent` (`signed`, `decimals`), `formatQuantity`, `formatMultiple`, `formatDate` (Date or ISO date, never shifted by timezone), and `formatTime`/`formatDateTime` (in an exchange's `MARKETS[m].timeZone`). Negative numbers use U+2212.
- **Config:** use `.env.local` (see `.env.example`). Leave `VITE_API_BASE_URL` empty in dev so requests go through the proxy. `VITE_API_PROXY_TARGET` defaults to `http://localhost:5239`.
- **Deferred:** auth (Firebase token verification is off in the API), a light theme, and generated API types (use `openapi-typescript` from Swagger if the DTOs grow). Don't build these unless asked.
- `AlgoSystems.Core.Portal` is the legacy ASP.NET MVC portal (Identity, Hangfire, NLog). It is not in the solution.

### Legacy / not in solution

`AlgoSystems.Core.Portal`, `AlgoSystems.Data`, `AlgoSystems.DataAccess`, `AlgoSystems.Database`, `AlgoSystems.Indicators` (the older copy of `AlgoSystems.Indicator`), `BusinessLogic`, `AlgoSystems.WebServices.Dto`, `AlgoSystems.Batch`, and `EODHistoricalData.NET*` are older projects, mostly net6.0. Don't change them unless asked.

## Notes

- `Scripts.sql` holds the ad hoc screening SQL that the scan rules are based on (big gainers, volume spikers, EMA21/EMA63 convergence).
- `ReadMe.txt` and several `appsettings.json` files contain real credentials and connection strings. Never copy them into code, docs, or commits.
