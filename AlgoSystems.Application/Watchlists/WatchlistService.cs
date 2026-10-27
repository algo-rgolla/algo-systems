using AlgoSystems.Application.Extensions;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Watchlists
{
    public class WatchlistService
    {
        private const string DefaultExchange = "AU";
        private static readonly string[] DeleteAuthorisedEmails = { "admin@algosystems.com.au", "madhu@gmail.com" };

        private readonly AlgoSystemsContext _dbContext;
        private readonly IUserContext _userContext;
        private readonly ILogger<WatchlistService> _logger;

        public WatchlistService(AlgoSystemsContext dbContext, IUserContext userContext, ILogger<WatchlistService> logger)
        {
            _dbContext = dbContext;
            _userContext = userContext;
            _logger = logger;
        }

        /// <summary>
        /// The most recent watchlist entry per stock that has a symbol detail, newest first.
        /// <see cref="WatchlistRules.IsValidWatchlistItem"/> is not applied here, so every watched stock is shown.
        /// </summary>
        public async Task<ProductsViewModel> GetWatchlistAsync(CancellationToken cancellationToken)
        {
            var model = new ProductsViewModel { Products = new List<ProductViewModel>() };

            var watchList = await _dbContext.Watchlists
                .AsNoTracking()
                .OrderByDescending(x => x.OpenData)
                .ToListAsync(cancellationToken);

            if (watchList.Count == 0)
                return model;

            // Codes are compared in SQL, so matching follows the database collation (case-insensitive);
            // the in-memory lookups below use the same rule.
            var detailRows = await _dbContext.EodhdSymbolDetails
                .AsNoTracking()
                .Where(d => _dbContext.Watchlists.Any(w => w.StockCode == d.Code))
                .ToListAsync(cancellationToken);
            var details = detailRows
                .GroupBy(d => d.Code, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => SelectDetail(g.Key, g.ToList()), StringComparer.OrdinalIgnoreCase);

            var symbolRows = await _dbContext.EodhdSymbols
                .AsNoTracking()
                .Where(s => _dbContext.Watchlists.Any(w => w.StockCode == s.Code))
                .OrderBy(s => s.Id)
                .Select(s => new { s.Code, s.Exchange })
                .ToListAsync(cancellationToken);
            var exchanges = symbolRows
                .GroupBy(s => s.Code, StringComparer.OrdinalIgnoreCase)
                .ToDictionary(g => g.Key, g => g.First().Exchange, StringComparer.OrdinalIgnoreCase);

            var existingSymbols = new HashSet<string>();
            foreach (var item in watchList)
            {
                if (item.StockCode == null || existingSymbols.Contains(item.StockCode))
                    continue;

                if (!details.TryGetValue(item.StockCode, out var product))
                    continue;

                var exchange = exchanges.TryGetValue(product.Code, out var symbolExchange) ? symbolExchange : DefaultExchange;

                model.Products.Add(product.ConvertWatchlistViewModel(item, exchange));
                existingSymbols.Add(item.StockCode);
            }

            model.Products = model.Products.OrderByDescending(x => x.ScanDate).ToList();

            _logger.LogDebug("Watchlist returned {ProductCount} products from {WatchlistRowCount} rows",
                model.Products.Count, watchList.Count);

            return model;
        }

        /// <summary>
        /// Deletes a watchlist entry. Only allow-listed emails may delete; an anonymous caller is allowed while
        /// API authentication is disabled.
        /// </summary>
        public async Task<WatchlistDeleteResult> DeleteWatchlistItemAsync(int id, CancellationToken cancellationToken)
        {
            string? email = _userContext.Email;
            if (!string.IsNullOrEmpty(email) && !DeleteAuthorisedEmails.Contains(email))
            {
                _logger.LogWarning("Watchlist item {WatchlistId} not deleted: user is not authorised to delete", id);
                return WatchlistDeleteResult.Forbidden;
            }

            var watchlistItem = await _dbContext.Watchlists
                .FirstOrDefaultAsync(x => x.WatchlistId == id, cancellationToken);

            if (watchlistItem == null)
            {
                _logger.LogWarning("Watchlist item {WatchlistId} not found", id);
                return WatchlistDeleteResult.NotFound;
            }

            _dbContext.Watchlists.Remove(watchlistItem);
            await _dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Watchlist item {WatchlistId} deleted", id);
            return WatchlistDeleteResult.Deleted;
        }

        // A code can have a row per exchange. Until the watchlist records its exchange, prefer the AU row.
        private EodhdSymbolDetail SelectDetail(string code, List<EodhdSymbolDetail> candidates)
        {
            if (candidates.Count == 1)
                return candidates[0];

            var selected = candidates
                .OrderBy(d => string.Equals(d.ExchangeShortName, DefaultExchange, StringComparison.OrdinalIgnoreCase) ? 0 : 1)
                .ThenBy(d => d.Id)
                .First();

            _logger.LogWarning("Watchlist stock {StockCode} matches {DetailCount} symbol details; using exchange {Exchange}",
                code, candidates.Count, selected.ExchangeShortName);

            return selected;
        }
    }
}
