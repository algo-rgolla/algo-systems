using System.Text.Json;
using System.Text.Json.Nodes;
using AlgoSystems.Domain.Entities.Models;
using AlgoSystems.Test.Infrastructure;
using BusinessObjects;

namespace AlgoSystems.Test.ProductScans
{
    /// <summary>
    /// Observable behaviour of the scan result and scan counter read paths, run against a real SQL Server database.
    /// Response bodies are compared as JSON using the same defaults ASP.NET Core MVC serializes with.
    /// </summary>
    [SetCulture("en-AU")]
    public abstract class ProductScanBehaviourTests
    {
        private static readonly JsonSerializerOptions WebJson = new(JsonSerializerDefaults.Web);
        private static readonly DateTime CreatedDate = new(2026, 10, 1);

        private SqlServerTestDatabase _database = null!;

        protected abstract Task<ProductsViewModel> GetScanResultsAsync(AlgoSystemsContext context, string? scanName);

        protected abstract Task<ScanCounterListDto> GetScanCountersAsync(AlgoSystemsContext context);

        [OneTimeSetUp]
        public void CreateDatabase() => _database = SqlServerTestDatabase.Create();

        [OneTimeTearDown]
        public void DropDatabase() => _database?.Drop();

        [SetUp]
        public Task ResetDatabase() => _database.ResetAsync();

        protected AlgoSystemsContext CreateContext(params Microsoft.EntityFrameworkCore.Diagnostics.IInterceptor[] interceptors)
            => _database.CreateContext(interceptors);

        [Test]
        public async Task NoResults_ReturnsTheScanNameAndNoProducts()
        {
            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(Serialize(result), Is.EqualTo(
                """{"scanType":"Scan_LongBigGainers","productViewType":null,"pageTotal":0,"pageHeader":null,"products":[]}"""));
        }

        [Test]
        public async Task Result_IsReturnedWithTheLegacyContract()
        {
            await SeedAsync(Detail("BHP", "AU"), Symbol("BHP", "Australia", "ASX"));
            await SeedAsync(Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 20, 16, 5, 0)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(Serialize(result), Is.EqualTo(Compact("""
                {
                  "scanType": "Scan_LongBigGainers", "productViewType": null, "pageTotal": 0, "pageHeader": null,
                  "products": [{
                    "id": 0, "portfolioId": 0, "symbol": "BHP", "exchange": "ASX", "name": "BHP Ltd",
                    "volume": "3333", "openPrice": "12.0000", "openDate": null, "closeDate": null, "close": null,
                    "change": null, "closePrice": "12.3400", "changePercent": "3.5", "status": null,
                    "marketCap": "500M", "industry": null, "sector": null, "profitLoss": null, "comments": null,
                    "tradeDays": null, "sellReason": null, "buyReason": null, "stopLoss": "11.5000",
                    "scanDate": "2026-10-20T16:05:00", "scanType": "Scan_LongBigGainers", "atr": "0.4200",
                    "action": null
                  }]
                }
                """)));
        }

        [Test]
        public async Task ResultWithNullFields_UsesEmptyStringsAndMinDate()
        {
            await SeedAsync(Detail("BHP", "AU"));
            await SeedAsync(new ProductScanResult { ScanType = "Scan_LongBigGainers", Symbol = "BHP", Exchange = "AU" });

            var product = (await GetResultsAsync("Scan_LongBigGainers")).Products.Single();

            Assert.Multiple(() =>
            {
                Assert.That(product.ScanDate, Is.EqualTo(DateTime.MinValue));
                Assert.That(product.OpenPrice, Is.Empty);
                Assert.That(product.StopLoss, Is.Empty);
                Assert.That(product.Volume, Is.Empty);
                Assert.That(product.Atr, Is.Empty);
            });
        }

        [Test]
        public async Task OnlyTheRequestedScanType_IsReturned_NewestFirst()
        {
            await SeedAsync(Detail("BHP", "AU"), Detail("CBA", "AU"), Detail("WES", "AU"), Detail("CSL", "AU"));
            await SeedAsync(
                Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 19)),
                Result("Scan_Long_Unusual_Volume", "CSL", "AU", new DateTime(2026, 10, 22)),
                Result("Scan_LongBigGainers", "CBA", "AU", new DateTime(2026, 10, 21)),
                Result("Scan_LongBigGainers", "WES", "AU", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "CBA", "WES", "BHP" }));
        }

        [Test]
        public async Task NullScanName_ReturnsResultsWithoutAScanType()
        {
            await SeedAsync(Detail("BHP", "AU"), Detail("CBA", "AU"));
            await SeedAsync(Result(null, "BHP", "AU", new DateTime(2026, 10, 20)), Result("Scan_LongBigGainers", "CBA", "AU", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync(null);

            Assert.That(result.ScanType, Is.Null);
            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "BHP" }));
        }

        [Test]
        public async Task ResultWithoutADetailOnItsExchange_IsExcluded()
        {
            await SeedAsync(Detail("BHP", "US"), Detail("CBA", "AU"));
            await SeedAsync(
                Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 21)),
                Result("Scan_LongBigGainers", "ZZZ", "AU", new DateTime(2026, 10, 21)),
                Result("Scan_LongBigGainers", null, "AU", new DateTime(2026, 10, 21)),
                Result("Scan_LongBigGainers", "CBA", "AU", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Symbol), Is.EqualTo(new[] { "CBA" }));
        }

        [Test]
        public async Task DetailIsMatchedOnCodeAndExchange()
        {
            var us = Detail("ABC", "US");
            us.Name = "ABC Inc";
            await SeedAsync(us, Detail("ABC", "AU"));
            await SeedAsync(Result("Scan_LongBigGainers", "ABC", "US", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Name), Is.EqualTo(new[] { "ABC Inc" }));
        }

        [Test]
        public async Task NullExchange_MatchesADetailWithoutAnExchange()
        {
            await SeedAsync(Detail("BHP", null));
            await SeedAsync(Result("Scan_LongBigGainers", "BHP", null, new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => (p.Symbol, p.Exchange)), Is.EqualTo(new[] { ("BHP", "AU") }));
        }

        // Existing behaviour: SingleOrDefault throws, so the endpoint returns 500.
        [Test]
        public async Task TwoDetailsForTheSameCodeAndExchange_Throws()
        {
            await SeedAsync(Detail("BHP", "AU"), Detail("BHP", "AU"));
            await SeedAsync(Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 20)));

            Assert.That(() => GetResultsAsync("Scan_LongBigGainers"), Throws.InvalidOperationException);
        }

        [Test]
        public async Task SameResultTwice_IsReturnedTwice()
        {
            await SeedAsync(Detail("BHP", "AU"));
            await SeedAsync(
                Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 20)),
                Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 21)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.ScanDate),
                Is.EqualTo(new[] { new DateTime(2026, 10, 21), new DateTime(2026, 10, 20) }));
        }

        [TestCase("AU", "Australia", "ASX")]
        [TestCase("US", "USA", "NASDAQ")]
        public async Task Exchange_ComesFromTheSymbolInTheResultsCountry(string exchange, string country, string expected)
        {
            await SeedAsync(Detail("ABC", exchange));
            await SeedAsync(Symbol("ABC", "Canada", "TSX"), Symbol("ABC", country, expected));
            await SeedAsync(Result("Scan_LongBigGainers", "ABC", exchange, new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Exchange), Is.EqualTo(new[] { expected }));
        }

        [Test]
        public async Task Exchange_UsesTheFirstMatchingSymbolRow()
        {
            await SeedAsync(Detail("BHP", "AU"));
            await SeedAsync(Symbol("BHP", "Australia", "ASX"));
            await SeedAsync(Symbol("BHP", "Australia", "CHIA"));
            await SeedAsync(Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Exchange), Is.EqualTo(new[] { "ASX" }));
        }

        [TestCase("AU", "Canada")]
        [TestCase("LSE", "UK")]
        public async Task Exchange_DefaultsToAu_WhenNoSymbolMatches(string exchange, string country)
        {
            await SeedAsync(Detail("ABC", exchange), Symbol("ABC", country, "OTHER"));
            await SeedAsync(Result("Scan_LongBigGainers", "ABC", exchange, new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => p.Exchange), Is.EqualTo(new[] { "AU" }));
        }

        // Existing behaviour: the detail is matched in SQL (case-insensitive collation), but the symbol row is
        // matched in memory with ordinal string comparison, so a differently cased code falls back to "AU".
        [Test]
        public async Task CodeCase_MatchesTheDetailButNotTheSymbol()
        {
            await SeedAsync(Detail("BHP", "AU"), Symbol("BHP", "Australia", "ASX"));
            await SeedAsync(Result("Scan_LongBigGainers", "bhp", "AU", new DateTime(2026, 10, 20)));

            var result = await GetResultsAsync("Scan_LongBigGainers");

            Assert.That(result.Products.Select(p => (p.Symbol, p.Exchange)), Is.EqualTo(new[] { ("BHP", "AU") }));
        }

        [Test]
        public async Task NoScanResults_ReturnNoCounters()
        {
            var counters = await GetCountersAsync();

            Assert.That(Serialize(counters), Is.EqualTo("""{"isAdmin":true,"scanCounters":[]}"""));
        }

        [Test]
        public async Task Counters_AreLabelledKnownScans_InFirstSeenOrder()
        {
            await SeedAsync(
                Result("Scan_LongBigGainers", "BHP", "AU", null),
                Result("Long_CFD_US_UnusualVolume", "NVDA", "US", null),
                Result("Scan_CFD_US_Short_BigLoosers", "TSLA", "US", null),
                Result("Scan_LongBigGainers", "CBA", "AU", null),
                Result(null, "WES", "AU", null),
                Result("", "WES", "AU", null),
                Result("Scan_Long_Unusual_Volume", "CSL", "AU", null),
                Result("Scan_Long_EMA_Crossover", "RIO", "AU", null),
                Result("Scan_CFD_US_Long_BigGainers", "AAPL", "US", null),
                Result("Scan_LongBigGainers", "WES", "AU", null));

            var counters = await GetCountersAsync();

            Assert.That(Serialize(counters), Is.EqualTo(Compact("""
                {
                  "isAdmin": true,
                  "scanCounters": [
                    { "scanTypeText": "Big Gainers", "scanType": "Scan_LongBigGainers", "scanResultCount": 3 },
                    { "scanTypeText": "US Big Loosers", "scanType": "Scan_CFD_US_Short_BigLoosers", "scanResultCount": 1 },
                    { "scanTypeText": "Unusual Volume", "scanType": "Scan_Long_Unusual_Volume", "scanResultCount": 1 },
                    { "scanTypeText": "EMA Crossover", "scanType": "Scan_Long_EMA_Crossover", "scanResultCount": 1 },
                    { "scanTypeText": "US Big Gainers", "scanType": "Scan_CFD_US_Long_BigGainers", "scanResultCount": 1 }
                  ]
                }
                """)));
        }

        // Existing behaviour: scan types are grouped and labelled with ordinal comparison, so differently cased
        // rows are neither counted nor merged into the known scan.
        [Test]
        public async Task Counters_IgnoreDifferentlyCasedScanTypes()
        {
            await SeedAsync(
                Result("scan_longbiggainers", "BHP", "AU", null),
                Result("Scan_LongBigGainers", "CBA", "AU", null));

            var counters = await GetCountersAsync();

            Assert.That(counters.ScanCounters.Select(c => (c.ScanType, c.ScanResultCount)),
                Is.EqualTo(new[] { ("Scan_LongBigGainers", 1) }));
        }

        private async Task<ProductsViewModel> GetResultsAsync(string? scanName)
        {
            await using var context = CreateContext();
            return await GetScanResultsAsync(context, scanName);
        }

        private async Task<ScanCounterListDto> GetCountersAsync()
        {
            await using var context = CreateContext();
            return await GetScanCountersAsync(context);
        }

        private static string Serialize<T>(T model) => JsonSerializer.Serialize(model, WebJson);

        // Property order is preserved, so the comparison still pins the serialized order.
        private static string Compact(string json) => JsonNode.Parse(json)!.ToJsonString();

        protected async Task SeedAsync(params object[] entities)
        {
            await using var context = CreateContext();
            context.AddRange(entities);
            await context.SaveChangesAsync();
        }

        protected static ProductScanResult Result(string? scanType, string? symbol, string? exchange, DateTime? scanDate) => new()
        {
            ScanType = scanType!,
            Symbol = symbol!,
            Exchange = exchange!,
            ScanDate = scanDate,
            OpenPrice = 12.00m,
            StopPrice = 11.50m,
            Volume = 3333,
            Atr = 0.42m,
        };

        protected static EodhdSymbolDetail Detail(string code, string? exchange) => new()
        {
            Code = code,
            Name = code + " Ltd",
            Type = "Common Stock",
            ExchangeShortName = exchange!,
            MarketCapitalization = 500_000_000,
            Close = 12.34m,
            ChangeP = 3.5m,
            CreatedDate = CreatedDate,
        };

        private static EodhdSymbol Symbol(string code, string country, string exchange) => new()
        {
            Code = code,
            Name = code + " Ltd",
            Exchange = exchange,
            Country = country,
            CreatedDate = CreatedDate,
        };
    }
}
