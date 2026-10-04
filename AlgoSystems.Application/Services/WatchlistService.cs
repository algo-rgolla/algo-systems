using AlgoSystems.Application.Extensions;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class WatchlistService : IWatchlistService
    {
        internal AlgoSystemsContext _context;

        public WatchlistService(AlgoSystemsContext context)
        {
            _context = context;
        }

        //public ProductsViewModel GetWatchList(string watchType)
        //{
        //    var model = new ProductsViewModel();
        //    model.Products = new List<ProductViewModel>();

        //    var watchlist = _context.Watchlists.ToList();
        //    if (watchlist.Count > 0)
        //    {
        //        foreach (var item in watchlist)
        //        {
        //            try
        //            {
        //                var product = _context.EodhdSymbolDetails.Where(x => x.Code == item.StockCode).Single();
        //                var productViewModel = product.ConvertProductViewModel();

        //                //Watchlist Item
        //                productViewModel.ScanDate = item.OpenData.Value;
        //                productViewModel.ScanType = GetScanTypeDescription(item.ScanType);

        //                productViewModel.OpenPrice = item.OpenPrice.HasValue ? item.OpenPrice.Value.ToString() : string.Empty;
        //                productViewModel.StopLoss = item.StopPrice.HasValue ? item.StopPrice.Value.ToString() : string.Empty;
        //                productViewModel.Volume = item.Volume.HasValue ? item.Volume.Value.ToString() : string.Empty;
        //                productViewModel.Atr = item.Atr.HasValue ? item.Atr.Value.ToString() : string.Empty; // Fix for CS0029

        //                model.Products.Add(productViewModel);
        //            }
        //            catch { }
        //        }
        //    }
        //    return model;

        //}

        private string GetScanTypeDescription(string scanType)
        {
            switch(scanType)
            {
                case "Scan_Long_EMA_Crossover":
                    return "EMA Crossover";
                case "Scan_Long_MACD_Histogram":
                    return "MACD Momentum";
                case "Scan_Long_MACD_Crossover":
                    return "MACD Crossover";
                case "Scan_Long_EMA_TrendStarters":
                    return "EMA Trend Starter";

            }

            return string.Empty;
        }
    }
}
