using AlgoSystems.Application.Common;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.Common;
using AlgoSystems.Common.Helpers;
using AlgoSystems.Domain.Entities.Models;
using AsxData.Batc.EodHD;
using EOD.Model.Bulks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class EodhdDownloadService : IEodhdDownloadService
    {
        private readonly AlgoSystemsContext _dbContext;
        private readonly EodHDClient eodClient;
        private readonly ILogger<EodhdDownloadService> _logger;

        public EodhdDownloadService(AlgoSystemsContext dbContext, ILogger<EodhdDownloadService> logger)
        {
            _dbContext = dbContext;
            _logger = logger;
            eodClient = new EodHDClient();
        }

        public async Task<bool> DownloadExchangeSymbols(string exchange)
        {
            var symbols = await eodClient.GetExchangeSymbolsAsync(exchange);
            symbols = symbols.Where(x => x.Type == "Common Stock").ToList();

            var algoCodes = _dbContext.EodhdSymbols.Select(x => x.Code).ToList();
            symbols = symbols.Where(x => !algoCodes.Contains(x.Code)).ToList();

            if (symbols.Any())
            {
                foreach (var symbol in symbols)
                {
                    var entity = new EodhdSymbol
                    {
                        Code = symbol.Code,
                        Name = symbol.Name,
                        Country = symbol.Country,
                        Exchange = symbol.Exchange,
                        Currency = symbol.Currency,
                        Type = symbol.Type,
                        Isin = symbol.Isin,
                        CreatedDate = DateTime.Now,
                        IsActive = true, 
                        UpdatedDate = DateTime.Now
                    };
                    _dbContext.EodhdSymbols.Add(entity);
                }
                await _dbContext.SaveChangesAsync();
            }

            // TODO: Set IsActive to false if it is not exist in the API response.

            return true;
        }

        public async Task<bool> DownloadSymbolDetails_AUS(string exchange)
        {
            var algoCodes = _dbContext.EodhdSymbols.Where(x => x.Exchange == exchange && x.Type == "Common Stock")
                .Select(x => x.Code).ToList();
            var stockSymbols = algoCodes
                 .Select(symbol => $"{symbol}.{exchange}")
                 .ToList();

            int chunkSize = 100;

            for (int i = 0; i < stockSymbols.Count; i += chunkSize)
            {
                var currentChunk = stockSymbols.GetRange(i, Math.Min(chunkSize, stockSymbols.Count - i));
                var bulkResult = await eodClient.GetExtendedBulksAsync("AU", string.Join(",", currentChunk));

                foreach (var item in bulkResult)
                {
                    var entity = _dbContext.EodhdSymbolDetails.FirstOrDefault(x => x.Code == item.Code);

                    bool isNew = false;
                    if (entity == null)
                    {
                        entity = new EodhdSymbolDetail
                        {
                            Code = item.Code,
                            CreatedDate = DateTime.Now
                        };
                        isNew = true;
                    }
                    else
                    {
                        entity.UpdatedDate = DateTime.Now;
                    }

                    entity.Name = item.Name;
                    entity.Type = item.Type;
                    entity.ExchangeShortName = item.Exchange_Short_Name;
                    entity.MarketCapitalization = Utils.ToLong(item.MarketCapitalization);
                    entity.Beta = Utils.ToDouble(item.Beta);
                    entity.Date = Utils.ToDateOnly(item.Date);

                    entity.Open = (decimal?)Utils.ToDouble(item.Open);
                    entity.High = (decimal?)Utils.ToDouble(item.High);
                    entity.Low = (decimal?)Utils.ToDouble(item.Low);
                    entity.Close = (decimal?)Utils.ToDouble(item.Close);
                    entity.AdjustedClose = (decimal?)Utils.ToDouble(item.Adjusted_Close);
                    entity.Volume = Utils.ToLong(item.Volume);
                    entity.Ema50d = (decimal?)Utils.ToDouble(item.Ema_50d);
                    entity.Ema200d = (decimal?)Utils.ToDouble(item.Ema_200d);
                    entity.Hi250d = (decimal?)Utils.ToDouble(item.Hi_250d);
                    entity.Lo250d = (decimal?)Utils.ToDouble(item.Lo_250d);
                    entity.PrevClose = (decimal?)Utils.ToDouble(item.Prev_Close);
                    entity.Change = (decimal?)Utils.ToDouble(item.Change);
                    entity.ChangeP = (decimal?)Utils.ToDouble(item.Change_P);
                    entity.Avgvol14d = (decimal?)Utils.ToDouble(item.Avgvol_14d);
                    entity.Avgvol50d = (decimal?)Utils.ToDouble(item.Avgvol_50d);
                    entity.Avgvol200d = (decimal?)Utils.ToDouble(item.Avgvol_200d);

                    if (isNew)
                        _dbContext.EodhdSymbolDetails.Add(entity);
                    else
                        _dbContext.EodhdSymbolDetails.Update(entity);

                    await _dbContext.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<bool> DownloadSymbolDetails_US(string exchange)
        {
            var algoCodes = _dbContext.EodhdSymbols
                .Where(x => new[] { "NYSE", "NASDAQ"}.Contains(x.Exchange))
                .Select(x => x.Code).ToList();
            var stockSymbols = algoCodes
                 .Select(symbol => $"{symbol}.{exchange}")
                 .ToList();

            int chunkSize = 100;
            int j = 0;
            for (int i = 0; i < stockSymbols.Count; i += chunkSize)
            {
                var currentChunk = stockSymbols.GetRange(i, Math.Min(chunkSize, stockSymbols.Count - i));
                var bulkResult = await eodClient.GetExtendedBulksAsync(exchange, string.Join(",", currentChunk));
        
                if (bulkResult == null) continue;
                foreach (var item in bulkResult)
                {
                    var entity = _dbContext.EodhdSymbolDetails.FirstOrDefault(x => x.Code == item.Code);
                    _logger.LogInformation($"Processing product {j}: {item.Code}" + DateTime.Now);
                    j++;

                    bool isNew = false;
                    if (entity == null)
                    {
                        entity = new EodhdSymbolDetail
                        {
                            Code = item.Code,
                            CreatedDate = DateTime.Now
                        };
                        isNew = true;
                    }
                    else
                    {
                        entity.UpdatedDate = DateTime.Now;
                    }

                    entity.Name = item.Name;
                    entity.Type = item.Type;
                    entity.ExchangeShortName = item.Exchange_Short_Name;
                    entity.MarketCapitalization = Utils.ToLong(item.MarketCapitalization);
                    entity.Beta = Utils.ToDouble(item.Beta);
                    entity.Date = Utils.ToDateOnly(item.Date);

                    entity.Open = (decimal?)Utils.ToDouble(item.Open);
                    entity.High = (decimal?)Utils.ToDouble(item.High);
                    entity.Low = (decimal?)Utils.ToDouble(item.Low);
                    entity.Close = (decimal?)Utils.ToDouble(item.Close);
                    entity.AdjustedClose = (decimal?)Utils.ToDouble(item.Adjusted_Close);
                    entity.Volume = Utils.ToLong(item.Volume);
                    entity.Ema50d = (decimal?)Utils.ToDouble(item.Ema_50d);
                    entity.Ema200d = (decimal?)Utils.ToDouble(item.Ema_200d);
                    entity.Hi250d = (decimal?)Utils.ToDouble(item.Hi_250d);
                    entity.Lo250d = (decimal?)Utils.ToDouble(item.Lo_250d);
                    entity.PrevClose = (decimal?)Utils.ToDouble(item.Prev_Close);
                    entity.Change = (decimal?)Utils.ToDouble(item.Change);
                    entity.ChangeP = (decimal?)Utils.ToDouble(item.Change_P);
                    entity.Avgvol14d = (decimal?)Utils.ToDouble(item.Avgvol_14d);
                    entity.Avgvol50d = (decimal?)Utils.ToDouble(item.Avgvol_50d);
                    entity.Avgvol200d = (decimal?)Utils.ToDouble(item.Avgvol_200d);

                    if (isNew)
                        _dbContext.EodhdSymbolDetails.Add(entity);
                    else
                        _dbContext.EodhdSymbolDetails.Update(entity);

                    await _dbContext.SaveChangesAsync();
                }
            }

            return true;
        }

        public async Task<bool> ClearStockScanData()
        {
            var symbols = _dbContext.ProductScanResults.Where(x => x.ScanDate < DateTime.Today).ToList();
            _dbContext.ProductScanResults.RemoveRange(symbols);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearWatchlistData()
        {
            var symbols = _dbContext.Watchlists.Where(x => x.OpenData < DateTime.Today.AddDays(-10)).ToList();
            _dbContext.Watchlists.RemoveRange(symbols);
            await _dbContext.SaveChangesAsync();
            return true;
        }

    }
}
