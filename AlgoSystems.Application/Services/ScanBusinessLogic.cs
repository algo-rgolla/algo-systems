using AlgoSystems.Application.Common;
using AlgoSystems.Application.Extensions;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.BusinessLogic.Common;
using AlgoSystems.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using AsxData.Batc.EodHD;
using BusinessObjects;
using EOD.Model;
using EOD.Model.TechnicalIndicators;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using NetTrader.Indicator;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EODModel = EOD.Model.TechnicalIndicators;

namespace AlgoSystems.Application.Services
{
    public class ScanBusinessLogic : IScanBusinessLogic
    {
        internal AlgoSystemsContext _dbContext;
        readonly HelperService _helperService;
        readonly EodHDClient eodClient;
        private readonly ILogger<ScanBusinessLogic> _logger;
        private readonly IUserContext _userContext;

        public ScanBusinessLogic(AlgoSystemsContext dbContext, ILogger<ScanBusinessLogic> logger,
            IUserContext userContext)
        {
            _dbContext = dbContext;
            _helperService = new HelperService(dbContext);
            eodClient = new EodHDClient();
            _logger = logger;
            _userContext = userContext;
        }

        public async Task<bool> ProcessEodProductScans()
        {
            _logger.LogInformation("BusinessLayer: Product Scans started at - " + DateTime.Now);

            var products = _dbContext.EodhdSymbolDetails
                .Where(x => x.MarketCapitalization > 150000000
                    && x.ExchangeShortName == "AU"
                    && x.Type == "Common Stock"
                    && x.Close > 0.20M)
                .ToList();
            //&& x.MarketCapitalization < 10000000000 //10B

            var asxDownloader = new AsxDownloader();
            int i = 1;

            foreach (var product in products)
            {
                var code = product.Code + ".AU";
                //if (code != "CSL.AU")
                //    continue; // Skip CSL for testing purposes

                _logger.LogInformation($"Processing product {i}: {code}" + DateTime.Now);
                i++;

                var liveProduct = await eodClient.GetLiveStockPricesAsync(code);
                var algoProduct = _dbContext.AlgoPortfolios.Where(x => x.Symbol == product.Code && x.OrderStatus == "Open").FirstOrDefault();

                if (liveProduct != null)
                {
                    ProductTechnicalDetails technicalDetails = await UpdateProductDetails(product, code, liveProduct);

                    // Only process if Change_p and Volume are valid
                    if (!liveProduct.Change_p.HasValue ||
                        !liveProduct.Volume.HasValue ||
                        liveProduct.Change_p < 1 ||
                        liveProduct.Change_p > 8 ||
                        liveProduct.Volume < 300000 ||
                        (technicalDetails.Ema21.Count > 0 && (liveProduct.Close < technicalDetails.Ema21[^1].EMAData)) ||
                        (liveProduct.Close * liveProduct.Volume) < 300000 ||
                        technicalDetails.Macd[^1].Macd < technicalDetails.Macd[^1].Signal 
                        || technicalDetails.fiveDayPercentageGain > 25
                        || technicalDetails.IsHistogramIncreasing == false
                        )
                    {
                        continue;
                    }
                    // Check if it not already bought.
                    if (algoProduct != null && algoProduct.Volume > 0)
                        continue;

                    //Scan - EMACrossover
                    //if (ScanHelper.IsEmaCrossover(technicalDetails.Ema21, technicalDetails.Ema63, technicalDetails.Ema125))
                    //{
                    //    InsertScanResult(Scans.LongEMACrossover, product);
                    //}

                    //Scan - Unusual Volume
                    if (ScanHelper.IsUnusualVolume(liveProduct, product, technicalDetails.Ema21, technicalDetails.Ema63, technicalDetails.Ema125))
                        InsertScanResult(Scans.LongUnusualVolume, product);

                    //Scan - BigGainers
                    if (technicalDetails.IsHistogramIncreasing && 
                        ScanHelper.IsBigGainers(liveProduct, technicalDetails, product))
                    {
                        InsertScanResult(Scans.LongBigGainers, product);
                    }
                }
            }

            _logger.LogInformation("BusinessLayer: Product Scans ended at - " + DateTime.Now);

            return true;
        }

        private async Task<ProductTechnicalDetails> UpdateProductDetails(EodhdSymbolDetail product, string code, LiveStockPrice liveProduct)
        {
            var ema21 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 21);
            var ema63 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 63);
            var ema125 = await eodClient.GetEMAAsync(code, DateTime.Now.AddDays(-200), DateTime.Now, 125);
            var macd = await eodClient.GetMACDAsync(code, null, DateTime.Now.AddDays(-200), DateTime.Now);
            var atr = await eodClient.GetAverageTrueRangeAsync(code, 50, DateTime.Now.AddDays(-200), DateTime.Now);
            var fiveDayHistory= await eodClient.GetHistoricalStockPricesAsync(code, DateTime.Now.AddDays(-5), DateTime.Now.AddDays(-1));

            int fiveDayGainPercent = GetFiveDayPercentageGain(fiveDayHistory, liveProduct?.Close);
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
                _dbContext.SaveChanges();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating product details for {code}: {ex.Message}");
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

        private int GetFiveDayPercentageGain(List<HistoricalStockPrice> fiveDayHistory, double? close)
        {
            if (!close.HasValue || close <= 0)
                return 0;
            if (fiveDayHistory == null)
                return 0;
            if (fiveDayHistory != null && fiveDayHistory.Count == 0)
                return 0;
            double fiveDayLow = (double)fiveDayHistory.Min(x => x?.Close);
            double gain = (double)(((close - fiveDayLow) / fiveDayLow) * 100);
            return gain > 0 ? (int)Math.Round(gain) : 0;
        }

        public void InsertScanResult(string scanType, EodhdSymbolDetail product)
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au" && email != "madhu@gmail.com"))
            {
                _logger.LogError("User email is not authorized to insert scan result.");
                return;
            }
            var symbol = product.Code.Replace(".AU", "");
            var scanResult = _dbContext.ProductScanResults.Where(x => x.Symbol == symbol
            && x.ScanType == scanType).ToList();
            var stopLoss = Utils.GetStopLoss(product);
            var riskOnStock = product.Close.HasValue && stopLoss > 0 ? product.Close.Value - (decimal?)stopLoss : 0;
            var volume = riskOnStock > 0 ? Convert.ToInt32(Constants.Portfolio_Position_Risk / riskOnStock) : 0;

            if (scanResult.Count == 0)
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
                    _dbContext.ProductScanResults.Add(row);
                    _dbContext.Watchlists.Add(watch);
                    _dbContext.SaveChanges();
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error inserting scan result for {symbol}: {ex.Message}");
                }
            }
        }

        public ProductsViewModel GetProductScanResult(LongScanViewModel request)
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();

            var scanResults = _dbContext.ProductScanResults.Where(x => x.ScanType == request.ScanName).ToList();

            model.ScanType = request.ScanName;

            if (scanResults.Count > 0)
            {
                foreach (var scanResult in scanResults)
                {
                    var code = scanResult.Symbol.Replace(".AU", "");
                    var product = _dbContext.EodhdSymbolDetails.Where(x => x.Code == code).SingleOrDefault();
                    if (product == null) continue;
                    var productViewModel = product.ConvertEodProductViewModel(scanResult);

                    model.Products.Add(productViewModel);
                }
            }
            return model;
        }

        public async Task<ScanCounterListDto> GetScanCounters()
        {
            var model = new ScanCounterListDto();
            model.ScanCounters = new List<ScanCounterDto>();
            //model.IsAdmin = _userContext.Email == "madhu@gmail.com";
            model.IsAdmin = true;

            var results = await _dbContext.ProductScanResults.ToListAsync();
            var scanResults = results.GroupBy(x => x.ScanType)
                .Select(g => new { ScanType = g.Key, Count = g.Count() })
                .ToList();
            foreach (var result in scanResults)
            {
                if (string.IsNullOrEmpty(result.ScanType))
                    continue;
                switch (result.ScanType)
                {
                    case "Scan_Long_EMA_Crossover":
                        model.ScanCounters.Add(new ScanCounterDto { ScanType = result.ScanType, ScanTypeText = "EMA Crossover", ScanResultCount = result.Count });
                        break;
                    case "Scan_Long_Unusual_Volume":
                        model.ScanCounters.Add(new ScanCounterDto { ScanType = result.ScanType, ScanTypeText = "Unusual Volume", ScanResultCount = result.Count });
                        break;
                    case "Scan_LongBigGainers":
                        model.ScanCounters.Add(new ScanCounterDto { ScanType = result.ScanType, ScanTypeText = "Big Gainers", ScanResultCount = result.Count });
                        break;                        
                    case "Scan_CFD_US_Long_BigGainers":
                        model.ScanCounters.Add(new ScanCounterDto { ScanType = result.ScanType, ScanTypeText = "US Big Gainers", ScanResultCount = result.Count });
                        break;
                    case "Scan_CFD_US_Short_BigLoosers":
                        model.ScanCounters.Add(new ScanCounterDto { ScanType = result.ScanType, ScanTypeText = "US Big Loosers", ScanResultCount = result.Count });
                        break;
                }
            }
            return model;
        }

        public async Task<ProductsViewModel> GetProductScanResultAsync(LongScanViewModel request)
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();

            var scanResults = await _dbContext.ProductScanResults.Where(x => x.ScanType == request.ScanName).OrderByDescending(x => x.ScanDate).ToListAsync();
            var eodSymbols = _dbContext.EodhdSymbols.ToList();

            model.ScanType = request.ScanName;

            if (scanResults.Count > 0)
            {
                foreach (var scanResult in scanResults)
                {
                    //var code = scanResult.Symbol.Replace(".AU", "");
                    var product = _dbContext.EodhdSymbolDetails.Where(x => x.Code == scanResult .Symbol&& x.ExchangeShortName == scanResult.Exchange).SingleOrDefault();
                    if (product == null) continue;
                    //TODO: Skip if change < 2%
                    //if (product.ChangeP.HasValue && (double)product.ChangeP.Value < 2.5) continue;

                    EodhdSymbol eodSymbol = null;
                    if (scanResult.Exchange == "AU")
                        eodSymbol  = eodSymbols.Where(x => x.Code == scanResult.Symbol && x.Country == "Australia").FirstOrDefault();
                    else if(scanResult.Exchange == "US")
                        eodSymbol = eodSymbols.Where(x => x.Code == scanResult.Symbol && x.Country == "USA").FirstOrDefault();

                    var productViewModel = product.ConvertEodProductViewModel(scanResult, eodSymbol);

                    model.Products.Add(productViewModel);
                }
            }
            return model;
        }

        public async Task<bool> LogUserDetails(string userId)
        {
            var userAccessLog = new UserAccessLog
            {
                UserName = userId,
                LoggedTime = DateTime.Now
            };
            _dbContext.UserAccessLogs.Add(userAccessLog);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public ScanResultCountViewModel GetProductScanResults()
        {
            var model = new ScanResultCountViewModel();

            var results = _dbContext.ProductScanResults.ToList();

            foreach (var result in results)
            {
                if (string.IsNullOrEmpty(result.ScanType))
                    continue;

                switch (result.ScanType)
                {
                    case "Scan_Long_MACD_Crossover":
                        model.Scan_Long_MACD_Crossover_Count++;
                        break;
                    case "Scan_Long_MACD_Histogram":
                        model.Scan_Long_MACD_Histogram_Count++;
                        break;
                }
            }

            return model;
        }

        public async Task<bool> ProcessUSProductScans()
        {
            _logger.LogInformation("BusinessLayer: Product Scans started at - " + DateTime.Now);

            var products = await _dbContext.EodhdSymbolDetails
                .Where(x => x.MarketCapitalization > 1000000000
                    && x.ExchangeShortName == "US"
                    && x.Type == "Common Stock"
                    )
                .ToListAsync();

            var asxDownloader = new AsxDownloader();
            int i=1;
            foreach (var product in products)
            {
                var code = product.Code + ".US";
                //if (code != "CSL.AU")
                //    continue; // Skip CSL for testing purposes
                _logger.LogInformation($"Processing product {i}: {code}" + DateTime.Now);
                i++;
                var liveProduct = await eodClient.GetLiveStockPricesAsync(code);
                //var algoProduct = _dbContext.AlgoPortfolios.Where(x => x.Symbol == product.Code && x.OrderStatus == "Open").FirstOrDefault();

                if (liveProduct != null)
                {
                    // Only process if Change_p and Volume are valid
                    if (!liveProduct.Change_p.HasValue ||
                        !liveProduct.Volume.HasValue ||
                        liveProduct.Change_p < 1 ||
                        liveProduct.Change_p > 10 ||
                        liveProduct.Volume < 300000 ||
                        (liveProduct.Close * liveProduct.Volume) < 1000000 )
                    {
                        continue;
                    }
                    ProductTechnicalDetails technicalDetails = await UpdateProductDetails(product, code, liveProduct);

                    if (technicalDetails.Macd == null || technicalDetails.Macd.Count == 0)
                        continue;

                    if (technicalDetails.Ema21 == null || technicalDetails.Ema21.Count == 0)
                        continue;

                    if (liveProduct.Close < technicalDetails.Ema21[^1].EMAData
                        || technicalDetails.Macd[^1].Macd < technicalDetails.Macd[^1].Signal
                        || technicalDetails.fiveDayPercentageGain > 25
                        )
                    {
                        continue;
                    }

                    //Scan - Unusual Volume
                    if (ScanHelper.IsUS_UnusualVolume(liveProduct, product, technicalDetails))
                        InsertScanResult(Scans.Long_CFD_US_UnusualVolume, product);

                }
            }

            _logger.LogInformation("BusinessLayer: Product Scans ended at - " + DateTime.Now);

            return true;
        }


    }
}