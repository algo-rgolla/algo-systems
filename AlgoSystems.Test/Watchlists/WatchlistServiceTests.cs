using AlgoSystems.Application.Watchlists;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using AlgoSystems.Test.Infrastructure;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace AlgoSystems.Test.Watchlists
{
    [TestFixture]
    public class WatchlistServiceTests : WatchlistBehaviourTests
    {
        protected override Task<ProductsViewModel> GetWatchlistAsync(AlgoSystemsContext context, IUserContext userContext)
            => Create(context, userContext).GetWatchlistAsync(CancellationToken.None);

        protected override Task<bool> DeleteAsync(AlgoSystemsContext context, IUserContext userContext, int id)
            => Create(context, userContext).DeleteWatchlistItemAsync(id, CancellationToken.None);

        [Test]
        public async Task GetWatchlist_WhenCancelled_Throws()
        {
            await using var context = CreateContext();
            var service = Create(context, new TestUserContext(null));

            Assert.That(() => service.GetWatchlistAsync(new CancellationToken(canceled: true)),
                Throws.InstanceOf<OperationCanceledException>());
        }

        [Test]
        public async Task Delete_WhenCancelled_ThrowsAndKeepsTheRow()
        {
            await using (var seed = CreateContext())
            {
                seed.Watchlists.Add(new Watchlist { StockCode = "BHP", OpenData = new DateTime(2026, 10, 20) });
                await seed.SaveChangesAsync();
            }

            await using var context = CreateContext();
            var id = await context.Watchlists.Select(x => x.Id).SingleAsync();
            var service = Create(context, new TestUserContext(AdminEmail));

            Assert.That(() => service.DeleteWatchlistItemAsync(id, new CancellationToken(canceled: true)),
                Throws.InstanceOf<OperationCanceledException>());
            Assert.That(await context.Watchlists.CountAsync(), Is.EqualTo(1));
        }

        private static WatchlistService Create(AlgoSystemsContext context, IUserContext userContext)
            => new(context, userContext, NullLogger<WatchlistService>.Instance);
    }
}
