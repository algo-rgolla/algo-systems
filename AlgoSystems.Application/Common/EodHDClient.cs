using EOD;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EODHistoricalData.Wrapper.Model.TechnicalIndicators;
using EODHistoricalData.Wrapper.Utils;
using System.IO;

using static EOD.API;
using EOD.Model;
using EOD.Model.TechnicalIndicators;
using System.Linq.Expressions;
using System.Reflection;
using EOD.Model.Bulks;
using EODHistoricalData.Wrapper.Model.Bulks;

namespace AsxData.Batc.EodHD
{
    public class EodHDClient
    {
        private readonly API _api;
        private readonly API _apiProxy;
        private readonly API _apiSource;

        public EodHDClient()
        {
            string apiKey = "625bad3d225845.26455540";            
            System.Net.WebProxy proxy = new("localhost:80");
            _api = new API(apiKey);
            _apiProxy = new API(apiKey, proxy);
            _apiSource = new API(apiKey, null, "EODHistoricalData.Downloader");
        }

        public async Task<List<ExchangeSymbol>> GetExchangeSymbolsAsync(string exchange)
        {
            //Australia - "AU"
            var result = await _api.GetExchangeSymbolsAsync(exchange);
            return result;
        }

        public async Task<List<HistoricalStockPrice>> GetEndOfDayDataAsync(string symbol, DateTime startDt, DateTime endDt)
        {
            var result = await _api.GetEndOfDayHistoricalStockPriceAsync(symbol, startDt, endDt, HistoricalPeriod.Daily);
            return result;
        }

        public async Task<List<EMA>> GetEMAAsync(string symbol, DateTime startDt, DateTime endDt, int days)
        {
            var result = await _api.GetEMAAsync(symbol, days, startDt, endDt);
            return result;
        }
        public async Task<List<AverageTrueRange>> GetAverageTrueRangeAsync(string symbol, int? period, DateTime startDt, DateTime endDt)
        {
            var result = await _api.GetAverageTrueRangeAsync(symbol, period, startDt, endDt);
            return result;
        }

        public async Task<List<HistoricalStockPrice>> GetHistoricalStockPricesAsync(string symbol, DateTime from, DateTime endDt)
        {
            var result = await _api.GetEndOfDayHistoricalStockPriceAsync(symbol, from, endDt, HistoricalPeriod.Daily);
            return result;
        }
        public async Task<List<MovingAverageConvergence>> GetMACDAsync(string symbol, int? period, DateTime startDt, DateTime endDt)
        {
            try
            {
                var result = await _api.GetMovingAverageConvergenceAsync(symbol, period, startDt, endDt);
                return result;
            }
            catch 
            {
                return new List<MovingAverageConvergence>();
            }

        }

        public async Task<List<LiveStockPrice>> GetManyLiveStockPricesAsync(string symbol, List<string> symbolList)
        {
            var result = await _api.GetLiveStockPricesAsync(symbol, symbolList);
            return result;
        }

        public async Task<LiveStockPrice> GetLiveStockPricesAsync(string symbol)
        {
            var result = await _api.GetLiveStockPricesAsync(symbol);
            return result;
        }

        /// <summary>
        /// symbols - "MSFT, AAPL"
        /// </summary>
        /// <param name="symbols"></param>
        /// <returns></returns>
        public async Task<List<ExtendedBulk>> GetExtendedBulksAsync(string exchange, string symbols)
        {
            var result = await _api.GetExtendedBulksAsync(exchange, BulkQueryTypes.EndOfDay, null, symbols);
            return result;
        }

    }
}
