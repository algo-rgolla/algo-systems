using System.Text.Json;
using System.Text.Json.Nodes;
using AlgoSystems.Application.Watchlists;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using AlgoSystems.Test.Infrastructure;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;

namespace AlgoSystems.Test.Watchlists
{
    /// <summary>
    /// Observable behaviour of the watchlist read and delete paths, run against a real SQL Server database.
    /// Response bodies are compared as JSON using the same defaults ASP.NET Core MVC serializes with.
    /// </summary>
    [SetCulture("en-AU")]
    public abstract class WatchlistBehaviourTests
    {
        protected const string AdminEmail = "admin@algosystems.com.au";

        private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);
        private static readonly DateTime CreatedDate = new(2026, 10, 1);

        private SqlServerTestDatabase _database = null!;

        protected abstract Task<ProductsViewModel> GetWatchlistAsync(AlgoSystemsContext context, IUserContext userContext);

        protected abstract Task<WatchlistDeleteResult> DeleteAsync(AlgoSystemsContext context, IUserContext userContext, int id);

        [OneTimeSetUp]
        public void CreateDatabase() => _database = SqlServerTestDatabase.Create();

        [OneTimeTearDown]
        public void DropDatabase() => _database?.Drop();

        [SetUp]
        public Task ResetDatabase() => _database.ResetAsync();

        protected AlgoSystemsContext CreateContext() => _database.CreateContext();

        [Test]
        public async Task EmptyWatchlist_ReturnsNoProducts()
        {
            var result = await GetAsync();

            Assert.That(Serialize(result), Is.EqualTo(
                """{"scanType":null,"productViewType":null,"pageTotal":0,"pageHeader":null,"products":[]}"""));
        }

        [Test]
        public async Task ActiveItem_IsReturnedWithTheLegacyContract()
        {
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "AU"));
            var item = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20, 9, 30, 0));

            var result = await GetAsync();

            Assert.That(Serialize(result), Is.EqualTo(Compact($$"""
                {
                  "scanType": null, "productViewType": null, "pageTotal": 0, "pageHeader": null,
                  "products": [{
                    "id": {{item.WatchlistId}}, "portfolioId": 0, "symbol": "BHP", "exchange": "AU", "name": "BHP Ltd",
                    "volume": "1000", "openPrice": "12.0000", "openDate": null, "closeDate": null, "close": null,
                    "change": null, "closePrice": "12.3400", "changePercent": "3.5", "status": null,
                    "marketCap": "500M", "industry": null, "sector": null, "profitLoss": null, "comments": null,
                    "tradeDays": null, "sellReason": null, "buyReason": null, "stopLoss": "11.5000",
                    "scanDate": "2026-10-20T09:30:00", "scanType": null, "atr": "0.4200",
                    "action": null
                  }]
                }
                """)));
        }

        [Test]
        public async Task ExchangeComesFromTheSymbolRow()
        {
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "ASX"));
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Single().Exchange, Is.EqualTo("ASX"));
        }

        [Test]
        public async Task ItemFailingTheWatchlistRules_IsStillShown()
        {
            var quiet = ActiveDetail("CBA");
            quiet.ChangeP = 2.5m;
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "AU"), quiet, Symbol("CBA", "AU"));
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));
            await SeedWatchAsync("CBA", new DateTime(2026, 10, 21));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "CBA", "BHP" }));
        }

        [Test]
        public async Task ItemWithoutSymbolDetail_IsExcluded()
        {
            await SeedWatchAsync("ZZZ", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products, Is.Empty);
        }

        [Test]
        public async Task ItemWithoutStockCode_IsExcluded()
        {
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "AU"));
            await SeedWatchAsync(null, new DateTime(2026, 10, 21));
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "BHP" }));
        }

        [Test]
        public async Task RepeatedStockCode_ReturnsOnlyTheMostRecentRow()
        {
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "AU"));
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 18));
            var latest = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Id),
                Is.EqualTo(new[] { latest.WatchlistId }));
        }

        [Test]
        public async Task Items_AreOrderedByScanDateDescending_WithUndatedRowsLast()
        {
            await SeedAsync(
                ActiveDetail("BHP"), Symbol("BHP", "AU"),
                ActiveDetail("CBA"), Symbol("CBA", "AU"),
                ActiveDetail("WES"), Symbol("WES", "AU"));
            await SeedWatchAsync("WES", null);
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 19));
            await SeedWatchAsync("CBA", new DateTime(2026, 10, 21));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "CBA", "BHP", "WES" }));
            Assert.That(result.Products[^1].ScanDate, Is.EqualTo(DateTime.MinValue));
        }

        [Test]
        public async Task StockCodeMatching_IsCaseInsensitive()
        {
            await SeedAsync(ActiveDetail("BHP"), Symbol("BHP", "AU"));
            await SeedWatchAsync("bhp", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "BHP" }));
        }

        // Approved change D2: previously SingleOrDefault threw and the endpoint returned 500.
        [Test]
        public async Task CodeListedOnTwoExchanges_UsesTheAuDetail()
        {
            var us = ActiveDetail("ABC", "US");
            us.Name = "ABC Inc";
            await SeedAsync(us, ActiveDetail("ABC", "AU"), Symbol("ABC", "AU"));
            await SeedWatchAsync("ABC", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Name), Is.EqualTo(new[] { "ABC Ltd" }));
        }

        // Approved change D3: previously a NullReferenceException returned 500 for the whole list.
        [Test]
        public async Task ItemWithoutSymbolRow_DefaultsExchangeToAu()
        {
            await SeedAsync(ActiveDetail("BHP"));
            await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var result = await GetAsync();

            Assert.That(result.Products.Select(p => p.Exchange), Is.EqualTo(new[] { "AU" }));
        }

        [Test]
        public async Task Delete_ByAdmin_RemovesOnlyThatRow()
        {
            var target = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));
            var other = await SeedWatchAsync("CBA", new DateTime(2026, 10, 20));

            var deleted = await DeleteAsAsync(AdminEmail, target.WatchlistId);

            Assert.That(deleted, Is.EqualTo(WatchlistDeleteResult.Deleted));
            Assert.That(await RemainingWatchIdsAsync(), Is.EqualTo(new[] { other.WatchlistId }));
        }

        [Test]
        public async Task Delete_MissingId_ReturnsNotFound()
        {
            var existing = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var deleted = await DeleteAsAsync(AdminEmail, existing.WatchlistId + 1000);

            Assert.That(deleted, Is.EqualTo(WatchlistDeleteResult.NotFound));
            Assert.That(await RemainingWatchIdsAsync(), Is.EqualTo(new[] { existing.WatchlistId }));
        }

        [TestCase("someone@example.com")]
        [TestCase("ADMIN@algosystems.com.au")]
        public async Task Delete_ByNonAdmin_ReturnsForbiddenAndKeepsTheRow(string email)
        {
            var existing = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var deleted = await DeleteAsAsync(email, existing.WatchlistId);

            Assert.That(deleted, Is.EqualTo(WatchlistDeleteResult.Forbidden));
            Assert.That(await RemainingWatchIdsAsync(), Is.EqualTo(new[] { existing.WatchlistId }));
        }

        // API authentication is disabled, so every caller is anonymous; anonymous deletes are allowed until it is enabled.
        [TestCase(null)]
        [TestCase("")]
        public async Task Delete_ByAnonymousCaller_RemovesTheRow(string? email)
        {
            var existing = await SeedWatchAsync("BHP", new DateTime(2026, 10, 20));

            var deleted = await DeleteAsAsync(email, existing.WatchlistId);

            Assert.That(deleted, Is.EqualTo(WatchlistDeleteResult.Deleted));
            Assert.That(await RemainingWatchIdsAsync(), Is.Empty);
        }

        private async Task<ProductsViewModel> GetAsync()
        {
            await using var context = CreateContext();
            return await GetWatchlistAsync(context, new TestUserContext(null));
        }

        private async Task<WatchlistDeleteResult> DeleteAsAsync(string? email, int id)
        {
            await using var context = CreateContext();
            return await DeleteAsync(context, new TestUserContext(email), id);
        }

        private async Task<int[]> RemainingWatchIdsAsync()
        {
            await using var context = CreateContext();
            return await context.Watchlists.OrderBy(x => x.WatchlistId).Select(x => x.WatchlistId).ToArrayAsync();
        }

        private static string Serialize(ProductsViewModel model) => JsonSerializer.Serialize(model, WebJson);

        // Property order is preserved, so the comparison still pins the serialized order.
        private static string Compact(string json) => JsonNode.Parse(json)!.ToJsonString();

        private async Task SeedAsync(params object[] entities)
        {
            await using var context = CreateContext();
            context.AddRange(entities);
            await context.SaveChangesAsync();
        }

        private async Task<Watchlist> SeedWatchAsync(string? stockCode, DateTime? openDate)
        {
            var item = new Watchlist
            {
                StockCode = stockCode!,
                OpenData = openDate,
                OpenPrice = 12.00m,
                StopPrice = 11.50m,
                OrderStatus = "Long",
                Volume = 1000,
                Atr = 0.42m,
            };
            await SeedAsync(item);
            return item;
        }

        protected static EodhdSymbolDetail ActiveDetail(string code, string exchange = "AU") => new()
        {
            Code = code,
            Name = code + " Ltd",
            Type = "Common Stock",
            ExchangeShortName = exchange,
            MarketCapitalization = 500_000_000,
            Close = 12.34m,
            PrevClose = 11.90m,
            ChangeP = 3.5m,
            Volume = 1_000_000,
            Ema21 = 11m,
            Ema63 = 10m,
            Macd = 0.2m,
            SignalLine = 0.1m,
            CreatedDate = CreatedDate,
        };

        private static EodhdSymbol Symbol(string code, string exchange) => new()
        {
            Code = code,
            Name = code + " Ltd",
            Exchange = exchange,
            Country = exchange == "US" ? "USA" : "Australia",
            CreatedDate = CreatedDate,
        };
    }
}
