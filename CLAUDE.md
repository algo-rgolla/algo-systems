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

React UI (`AlgoSystems.React.UI/algosystems.react.ui`, which is Vite + React 19 + TypeScript):

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run lint      # eslint
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

- `AlgoSystems.React.UI/algosystems.react.ui` is a newly scaffolded Vite app that is being rebuilt from scratch. The plan in `Ai_prompt_implementation.txt` calls for MUI, TanStack Query, React Router, a financial data grid and a charting library. It uses a feature-oriented `src/` layout (`app/`, `features/<feature>/`, `shared/`, `api/`) with a dark-first financial-dashboard theme where green means positive and red means negative. Server state lives in TanStack Query hooks per feature, and pages never call the API directly. The plan is built one phase at a time; each phase is verified with dev, build and lint before moving on.
- `AlgoSystems.Core.Portal` is the legacy ASP.NET MVC portal (Identity, Hangfire, NLog). It is not in the solution.

### Legacy / not in solution

`AlgoSystems.Core.Portal`, `AlgoSystems.Data`, `AlgoSystems.DataAccess`, `AlgoSystems.Database`, `AlgoSystems.Indicators` (the older copy of `AlgoSystems.Indicator`), `BusinessLogic`, `AlgoSystems.WebServices.Dto`, `AlgoSystems.Batch`, and `EODHistoricalData.NET*` are older projects, mostly net6.0. Don't change them unless asked.

## Notes

- `Scripts.sql` holds the ad hoc screening SQL that the scan rules are based on (big gainers, volume spikers, EMA21/EMA63 convergence).
- `ReadMe.txt` and several `appsettings.json` files contain real credentials and connection strings. Never copy them into code, docs, or commits.
