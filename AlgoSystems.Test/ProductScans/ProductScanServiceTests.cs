using System.Data.Common;
using AlgoSystems.Application.ProductScans;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging.Abstractions;

namespace AlgoSystems.Test.ProductScans
{
    [TestFixture]
    public class ProductScanServiceTests : ProductScanBehaviourTests
    {
        protected override Task<ProductsViewModel> GetScanResultsAsync(AlgoSystemsContext context, string? scanName)
            => Create(context).GetScanResultsAsync(scanName!, CancellationToken.None);

        protected override Task<ScanCounterListDto> GetScanCountersAsync(AlgoSystemsContext context)
            => Create(context).GetScanCountersAsync(CancellationToken.None);

        [Test]
        public async Task ScanResults_UseThreeQueries_HoweverManyResults()
        {
            for (var i = 0; i < 20; i++)
            {
                await SeedAsync(Detail("C" + i, "AU"), Result("Scan_LongBigGainers", "C" + i, "AU", new DateTime(2026, 10, 20)));
            }

            var counter = new CommandCounter();
            await using var context = CreateContext(counter);

            var result = await Create(context).GetScanResultsAsync("Scan_LongBigGainers", CancellationToken.None);

            Assert.That(result.Products, Has.Count.EqualTo(20));
            Assert.That(counter.Count, Is.EqualTo(3));
        }

        [Test]
        public async Task Counters_UseOneQuery()
        {
            await SeedAsync(Result("Scan_LongBigGainers", "BHP", "AU", null), Result("Scan_Long_Unusual_Volume", "CBA", "AU", null));

            var counter = new CommandCounter();
            await using var context = CreateContext(counter);

            await Create(context).GetScanCountersAsync(CancellationToken.None);

            Assert.That(counter.Count, Is.EqualTo(1));
        }

        [Test]
        public async Task Reads_DoNotTrackEntities()
        {
            await SeedAsync(Detail("BHP", "AU"), Result("Scan_LongBigGainers", "BHP", "AU", new DateTime(2026, 10, 20)));

            await using var context = CreateContext();
            var service = Create(context);
            await service.GetScanResultsAsync("Scan_LongBigGainers", CancellationToken.None);
            await service.GetScanCountersAsync(CancellationToken.None);

            Assert.That(context.ChangeTracker.Entries(), Is.Empty);
        }

        [Test]
        public async Task ScanResults_WhenCancelled_Throws()
        {
            await using var context = CreateContext();

            Assert.That(() => Create(context).GetScanResultsAsync("Scan_LongBigGainers", new CancellationToken(canceled: true)),
                Throws.InstanceOf<OperationCanceledException>());
        }

        [Test]
        public async Task Counters_WhenCancelled_Throws()
        {
            await using var context = CreateContext();

            Assert.That(() => Create(context).GetScanCountersAsync(new CancellationToken(canceled: true)),
                Throws.InstanceOf<OperationCanceledException>());
        }

        private static ProductScanService Create(AlgoSystemsContext context)
            => new(context, NullLogger<ProductScanService>.Instance);

        private sealed class CommandCounter : DbCommandInterceptor
        {
            public int Count { get; private set; }

            public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
                DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result,
                CancellationToken cancellationToken = default)
            {
                Count++;
                return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
            }
        }
    }
}
