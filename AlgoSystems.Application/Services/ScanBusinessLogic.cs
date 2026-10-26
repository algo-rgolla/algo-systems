using AlgoSystems.Application.Common;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.Application.ProductScans;
using AlgoSystems.BusinessLogic.Common;
using AlgoSystems.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using AsxData.Batc.EodHD;
using EOD.Model;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    /// <summary>
    /// The daily scan batches: refreshes each candidate's symbol detail from EODHD, applies the scans and records
    /// hits in ProductScanResult and Watchlist. The API's scan reads are in <see cref="ProductScanService"/>.
    /// </summary>
    public class ScanBusinessLogic : IScanBusinessLogic
    {
        internal AlgoSystemsContext _dbContext;
        readonly EodHDClient eodClient;
        private readonly ILogger<ScanBusinessLogic> _logger;
        private readonly IUserContext _userContext;

        public ScanBusinessLogic(AlgoSystemsContext dbContext, ILogger<ScanBusinessLogic> logger,
            IUserContext userContext)
        {
            _dbContext = dbContext;
            eodClient = new EodHDClient();
            _logger = logger;
            _userContext = userContext;
        }

        public async Task<bool> ProcessEodProductScans(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("AU product scans started");

            // Tracked: each product's detail is refreshed and saved as it is processed.
            var products = await _dbContext.EodhdSymbolDetails
                .Where(x => x.MarketCapitalization > 150000000
                    && x.ExchangeShortName == "AU"
                    && x.Type == "Common Stock"
                    && x.Close > 0.20M)
                .ToListAsync(cancellationToken);
            //&& x.MarketCapitalization < 10000000000 //10B

            int i = 1;

            foreach (var product in products)
            {
                var code = product.Code + ".AU";

                _logger.LogInformation("Processing product {ProductNumber}: {Code}", i, code);
                i++;

                var liveProduct = await eodClient.GetLiveStockPricesAsync(code);

                if (liveProduct != null)
                {
                    ProductTechnicalDetails technicalDetails = await UpdateProductDetails(product, code, liveProduct, cancellationToken);

                    if (ProductScanRules.IsExcludedFromAuScans(liveProduct, technicalDetails))
                    {
                        continue;
                    }
                    // Check if it not already bought. Looked up only for stocks that pass the filter; tracked as
                    // before, because the batch shares this context with the portfolio services that run next.
                    var algoProduct = await _dbContext.AlgoPortfolios
                        .Where(x => x.Symbol == product.Code && x.OrderStatus == "Open")
                        .FirstOrDefaultAsync(cancellationToken);
                    if (algoProduct != null && algoProduct.Volume > 0)
                        continue;

                    //Scan - EMACrossover
                    //if (ScanHelper.IsEmaCrossover(technicalDetails.Ema21, technicalDetails.Ema63, technicalDetails.Ema125))
                    //{
                    //    InsertScanResult(Scans.LongEMACrossover, product);
                    //}

                    //Scan - Unusual Volume
                    if (ScanHelper.IsUnusualVolume(liveProduct, product, technicalDetails.Ema21, technicalDetails.Ema63, technicalDetails.Ema125))
                        await InsertScanResultAsync(Scans.LongUnusualVolume, product, cancellationToken);

                    //Scan - BigGainers
                    if (technicalDetails.IsHistogramIncreasing &&
                        ScanHelper.IsBigGainers(liveProduct, technicalDetails, product))
                    {
                        await InsertScanResultAsync(Scans.LongBigGainers, product, cancellationToken);
                    }
                }
            }

            _logger.LogInformation("AU product scans ended after {ProductCount} products", products.Count);

            return true;
        }

        public async Task<bool> ProcessUSProductScans(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("US product scans started");

            var products = await _dbContext.EodhdSymbolDetails
                .Where(x => x.MarketCapitalization > 1000000000
                    && x.ExchangeShortName == "US"
                    && x.Type == "Common Stock"
                    )
                .ToListAsync(cancellationToken);

            int i = 1;
            foreach (var product in products)
            {
                var code = product.Code + ".US";
                _logger.LogInformation("Processing product {ProductNumber}: {Code}", i, code);
                i++;
                var liveProduct = await eodClient.GetLiveStockPricesAsync(code);

                if (liveProduct != null)
                {
                    if (ProductScanRules.IsExcludedFromUsScansByPrice(liveProduct))
                    {
                        continue;
                    }
                    ProductTechnicalDetails technicalDetails = await UpdateProductDetails(product, code, liveProduct, cancellationToken);

                    if (ProductScanRules.IsExcludedFromUsScansByTechnicals(liveProduct, technicalDetails))
                    {
                        continue;
                    }

                    //Scan - Unusual Volume
                    if (ScanHelper.IsUS_UnusualVolume(liveProduct, product, technicalDetails))
                        await InsertScanResultAsync(Scans.Long_CFD_US_UnusualVolume, product, cancellationToken);

                }
            }

            _logger.LogInformation("US product scans ended after {ProductCount} products", products.Count);

            return true;
        }

        private async Task<ProductTechnicalDetails> UpdateProductDetails(EodhdSymbolDetail product, string code, LiveStockPrice liveProduct, CancellationToken cancellationToken)
        {
            var ema21 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 21);
            var ema63 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 63);
            var ema125 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 125);
            var macd = await eodClient.GetMACDAsync(code, null, DateTime.Now.AddDays(-200), DateTime.Now);
            var atr = await eodClient.GetAverageTrueRangeAsync(code, 50, DateTime.Now.AddDays(-200), DateTime.Now);
            var fiveDayHistory= await eodClient.GetHistoricalStockPricesAsync(code, DateTime.Now.AddDays(-5), DateTime.Now.AddDays(-1));

            int fiveDayGainPercent = ProductScanRules.GetFiveDayPercentageGain(fiveDayHistory, liveProduct?.Close);
            product.Close = liveProduct?.Close.HasValue == true ? (decimal?)liveProduct.Close : null;
            product.Open = liveProduct?.Open.HasValue == true ? (decimal?)liveProduct.Open : null;
            product.High = liveProduct?.High.HasValue == true ? (decimal?)liveProduct.High : null;
            product.Low = liveProduct?.Low.HasValue == true ? (decimal?)liveProduct.Low : null;
            product.Change = liveProduct?.Change.HasValue == true ? (decimal?)liveProduct.Change : null;
            product.ChangeP = liveProduct?.Change_p.HasValue == true ? (decimal?)liveProduct.Change_p : null;

            product.Volume = liveProduct?.Volume.HasValue == true ? (long?)liveProduct.Volume.Value : null;
            product.Ema21 = (ema21 != null && ema21.Count > 0) ? (decimal?)ema21[^1].EMAData : null;
            product.Ema63 = (ema63 != null && ema63.Count > 0) ? (decimal?)ema63[^1].EMAData : null;
            product.Ema125 = (ema125 != null && ema125.Count > 0) ? (decimal?)ema125[^1].EMAData : null;
            product.Macd = (macd!= null && macd.Count > 0) ? (decimal?)macd[^1].Macd : null;
            product.SignalLine = (macd != null && macd.Count > 0) ? (decimal?)macd[^1].Signal : null;
            product.Atr = (atr != null &&  atr.Count > 0 )? (decimal?)atr[^1].Atr : null;
            product.UpdatedDate = DateTime.Now;
            product.FiveDayGainPercent = fiveDayGainPercent;
            product.EmacrossOverDate = ScanHelper.GetEMACrossOverDate(ema21, ema63);
            product.IsHistogramIncreasing = ScanHelper.IsHistogramIncreasing(macd);
            try
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating product details for {Code}", code);
            }

            return new ProductTechnicalDetails
            {
                Ema21 = ema21,
                Ema63 = ema63,
                Ema125 = ema125,
                Macd = macd,
                Atr = atr,
                //FiveDayMax = fiveDayMax,
                IsHistogramIncreasing = ScanHelper.IsHistogramIncreasing(macd),
                fiveDayPercentageGain = fiveDayGainPercent
            };
        }

        private async Task InsertScanResultAsync(string scanType, EodhdSymbolDetail product, CancellationToken cancellationToken)
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au" && email != "madhu@gmail.com"))
            {
                _logger.LogError("User is not authorised to insert scan result {ScanType} for {Symbol}", scanType, product.Code);
                return;
            }
            var symbol = product.Code.Replace(".AU", "");
            var alreadyScanned = await _dbContext.ProductScanResults
                .AnyAsync(x => x.Symbol == symbol && x.ScanType == scanType, cancellationToken);
            var stopLoss = Utils.GetStopLoss(product);
            var volume = ProductScanRules.GetPositionSize(product.Close, stopLoss);

            if (!alreadyScanned)
            {
                var row = new ProductScanResult
                {
                    ScanDate = DateTime.Now,
                    ScanType = scanType,
                    Symbol = symbol,
                    Exchange = product.ExchangeShortName,
                    OpenPrice = product.Open.HasValue ? (decimal)product.Open.Value : 0, // Explicit cast added
                    Volume = volume,
                    Atr = product.Atr.HasValue ? (decimal?)product.Atr.Value : null,
                    StopPrice = (decimal?)stopLoss,
                };

                var watch = new Watchlist
                {
                    StockCode = symbol,
                    OpenData = DateTime.Now,
                    OrderStatus = "Long",
                    OpenPrice = product.Open.HasValue ? (decimal)product.Open.Value : 0, // Explicit cast added
                    Volume = volume,
                    Atr = product.Atr.HasValue ? (decimal?)product.Atr.Value : 0,
                    StopPrice = (decimal?)stopLoss,
                };
                try
                {
                    // One SaveChanges, so the scan result and watchlist row are written in one transaction.
                    _dbContext.ProductScanResults.Add(row);
                    _dbContext.Watchlists.Add(watch);
                    await _dbContext.SaveChangesAsync(cancellationToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error inserting scan result {ScanType} for {Symbol}", scanType, symbol);
                }
            }
        }
    }
}
