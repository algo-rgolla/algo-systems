using AlgoSystems.Application.Extensions;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AlgoSystems.Application.ProductScans
{
    public class ProductScanService
    {
        private const string AustraliaCountry = "Australia";
        private const string UsaCountry = "USA";

        private readonly AlgoSystemsContext _dbContext;
        private readonly ILogger<ProductScanService> _logger;

        public ProductScanService(AlgoSystemsContext dbContext, ILogger<ProductScanService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
        }

        /// <summary>
        /// The results of one scan, newest first. A result is shown only when its code has a symbol detail on the
        /// result's exchange; the displayed exchange comes from the symbol row for the result's country.
        /// </summary>
        public async Task<ProductsViewModel> GetScanResultsAsync(string scanName, CancellationToken cancellationToken)
        {
            var model = new ProductsViewModel { ScanType = scanName, Products = new List<ProductViewModel>() };

            var scanResults = await _dbContext.ProductScanResults
                .AsNoTracking()
                .Where(x => x.ScanType == scanName)
                .OrderByDescending(x => x.ScanDate)
                .ToListAsync(cancellationToken);

            if (scanResults.Count == 0)
                return model;

            // Details are matched in SQL, so code matching follows the database collation (case-insensitive).
            var detailMatches = await (
                    from result in _dbContext.ProductScanResults.Where(x => x.ScanType == scanName)
                    from detail in _dbContext.EodhdSymbolDetails
                        .Where(d => d.Code == result.Symbol && d.ExchangeShortName == result.Exchange)
                    select new { ScanResultId = result.Id, Detail = detail })
                .AsNoTracking()
                .ToListAsync(cancellationToken);
            var detailsByResult = detailMatches.ToLookup(x => x.ScanResultId, x => x.Detail);

            // Symbol rows are matched in memory with ordinal comparison. SQL narrows them to a case-insensitive
            // superset; Id order stands in for the unordered table read this replaced.
            var codes = scanResults.Where(x => x.Symbol != null).Select(x => x.Symbol).Distinct().ToList();
            var symbols = await _dbContext.EodhdSymbols
                .AsNoTracking()
                .Where(s => (s.Country == AustraliaCountry || s.Country == UsaCountry) && codes.Contains(s.Code))
                .OrderBy(s => s.Id)
                .ToListAsync(cancellationToken);

            foreach (var scanResult in scanResults)
            {
                // Throws when a code has two details on the same exchange, as the per-row lookup did.
                var product = detailsByResult[scanResult.Id].SingleOrDefault();
                if (product == null)
                    continue;

                var eodSymbol = FindSymbol(symbols, scanResult);
                model.Products.Add(product.ConvertEodProductViewModel(scanResult, eodSymbol));
            }

            _logger.LogDebug("Scan {ScanName} returned {ProductCount} products from {ScanResultCount} results",
                scanName, model.Products.Count, scanResults.Count);

            return model;
        }

        /// <summary>
        /// The number of results for each scan in <see cref="ProductScanCatalog"/>, in the order each scan first appears.
        /// </summary>
        public async Task<ScanCounterListDto> GetScanCountersAsync(CancellationToken cancellationToken)
        {
            var model = new ScanCounterListDto { IsAdmin = true, ScanCounters = new List<ScanCounterDto>() };

            // SQL narrows to the catalogued scans (case-insensitively); grouping and labelling stay ordinal.
            var scanTypes = await _dbContext.ProductScanResults
                .AsNoTracking()
                .Where(x => ProductScanCatalog.CounterScanTypes.Contains(x.ScanType))
                .OrderBy(x => x.Id)
                .Select(x => x.ScanType)
                .ToListAsync(cancellationToken);

            foreach (var group in scanTypes.GroupBy(x => x))
            {
                if (ProductScanCatalog.TryGetCounterLabel(group.Key, out var label))
                {
                    model.ScanCounters.Add(new ScanCounterDto { ScanType = group.Key, ScanTypeText = label, ScanResultCount = group.Count() });
                }
            }

            return model;
        }

        private static EodhdSymbol FindSymbol(List<EodhdSymbol> symbols, ProductScanResult scanResult)
        {
            if (scanResult.Exchange == "AU")
                return symbols.FirstOrDefault(x => x.Code == scanResult.Symbol && x.Country == AustraliaCountry);
            if (scanResult.Exchange == "US")
                return symbols.FirstOrDefault(x => x.Code == scanResult.Symbol && x.Country == UsaCountry);
            return null;
        }
    }
}
