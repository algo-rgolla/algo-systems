using AlgoSystems.Application.Common;
using AlgoSystems.Application.Extensions;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.BusinessLogic.Common;
using AlgoSystems.Common;
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
using System.ComponentModel.Design;
using System.Linq;
using System.Threading.Tasks;
using EODModel = EOD.Model.TechnicalIndicators;

namespace AlgoSystems.Application.Services
{
    public class SearchBusinessLogic : ISearchBusinessLogic
    {
        internal AlgoSystemsContext _dbContext;
        readonly HelperService _helperService;
        readonly EodHDClient eodClient;
        private readonly ILogger<ScanBusinessLogic> _logger;

        public SearchBusinessLogic(AlgoSystemsContext context, ILogger<ScanBusinessLogic> logger)
        {
            _dbContext = context;
            _helperService = new HelperService(context);
            eodClient = new EodHDClient();
            _logger = logger;
        }

        public async Task<SearchViewModel> SearchProductAsync(SearchViewModel request)
        {
            var model = new SearchViewModel();
            model.Products = new List<ProductViewModel>();
            List<EodhdSymbolDetail> scanResults = await GetSearchResults(request);
            var eodSymbols = _dbContext.EodhdSymbols.ToList();

            model.SearchType = request.SearchType;
            //Filter for scan results where the % of change between EMA21 and EMA63 is less than 5%.
            scanResults = scanResults.Where(x => x.Ema63 != 0 && Math.Abs((decimal)((x.Ema21 - x.Ema63) / x.Ema63 * 100)) < 2).ToList();

            if (scanResults != null && scanResults.Count > 0)
            {
                foreach (var product in scanResults)
                {
                    var stopLoss = Utils.GetStopLoss(product);
                    var riskOnStock = product.Close - (decimal?)stopLoss;
                    var volume = Convert.ToInt32(Constants.Portfolio_Position_Risk / riskOnStock);

                    EodhdSymbol eodSymbol = null;
                    if (product.ExchangeShortName == "AU")
                        eodSymbol = eodSymbols.Where(x => x.Code == product.Code && x.Country == "Australia").FirstOrDefault();
                    else if (product.ExchangeShortName == "US")
                        eodSymbol = eodSymbols.Where(x => x.Code == product.Code && x.Country == "USA").FirstOrDefault();

                    var productViewModel = product.ConvertEodProductViewModel(null, eodSymbol);
                    productViewModel.ScanDate = DateTime.Today;
                    productViewModel.StopLoss = stopLoss.ToString();
                    productViewModel.Volume = volume.ToString();
                    productViewModel.Atr = product.Atr.ToString();
                    productViewModel.Exchange = eodSymbol.Exchange;

                    model.Products.Add(productViewModel);
                }
            }
            return model;
        }

        private async Task<List<EodhdSymbolDetail>> GetSearchResults(SearchViewModel request)
        {
            List<EodhdSymbolDetail> response = new List<EodhdSymbolDetail>();

            if (request.SearchType == "Search_US_Long")
                response  = await _dbContext.EodhdSymbolDetails
                .Where(x => 
                    x.MarketCapitalization > 1000000000
                    && x.ChangeP > (decimal)1
                    && x.Close > (decimal?)x.Ema21
                    && x.Volume > 500000
                    && x.Close > (decimal?)x.PrevClose
                    && x.ChangeP < (decimal)8
                    && x.Macd > x.SignalLine
                    && (x.Volume * x.Close) > 1000000
                    && x.ExchangeShortName == "US"
                    && x.Volume > (x.Avgvol50d)
                    && x.IsHistogramIncreasing == true).ToListAsync();
            else
                response = await _dbContext.EodhdSymbolDetails
                .Where(x => 
                    x.MarketCapitalization > 200000000
                    && x.ChangeP > (decimal)1
                    && x.Close > (decimal?)x.Ema21
                    && x.Volume > 300000
                    && x.Close > (decimal?)x.PrevClose
                    && x.ChangeP < (decimal)8
                    && x.Macd > x.SignalLine
                    && (x.Volume * x.Close) > 300000
                    && x.Volume > (x.Avgvol50d)
                    && x.ExchangeShortName == "AU"
                    && x.Code.Length == 3
                    && x.IsHistogramIncreasing == true).ToListAsync();

            response = response.Where(x => ScanHelper.IsValidEmaDistance(x.Ema21, x.Ema63)).ToList();
            return response;
        }
    }
}
