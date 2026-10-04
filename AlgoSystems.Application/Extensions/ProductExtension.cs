using AlgoSystems.Application.Common;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Extensions
{
    public static class ProductExtension
    {
        public static ProductViewModel ConvertProductViewModel(this Product product)
        {
            var viewModel = new ProductViewModel
            {
                Symbol = product.Symbol,
                Name = product.Name,
                MarketCap = product.MarketCap != null ? Utils.ToKMB((decimal)product.MarketCap) : string.Empty,
                Close = product.Close.ToString(),
                ChangePercent = Math.Round(Convert.ToDouble(product.ChangePercent), 2).ToString(),
                Status = Convert.ToDecimal(product.ChangePercent) > 0 ? "Up" : "Down",
                Industry = product.Industry,
                Sector = product.Sector
            };

            return  viewModel;
        }
        public static ProductViewModel ConvertWatchlistViewModel(this EodhdSymbolDetail product, Watchlist watchlist, EodhdSymbol eodSymbol=null)
        {
            var viewModel = new ProductViewModel
            {
                Id = watchlist.Id,
                Symbol = product.Code,
                Exchange = eodSymbol.Exchange,
                Name = product.Name,
                MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty,
                ClosePrice = product.Close.ToString(),
                ChangePercent = Math.Round(Convert.ToDouble(product.ChangeP), 2).ToString(),
                ScanDate = watchlist.OpenData != null ? watchlist.OpenData.Value : DateTime.MinValue,
                ScanType = watchlist.ScanType,
                StopLoss = watchlist.StopPrice.HasValue ? watchlist.StopPrice.Value.ToString() : string.Empty,
                Volume = watchlist.Volume.HasValue ? watchlist.Volume.Value.ToString() : string.Empty,
                Atr = watchlist.Atr.HasValue ? watchlist.Atr.Value.ToString() : string.Empty,
                OpenPrice = watchlist.OpenPrice != 0 ? watchlist.OpenPrice.ToString() : string.Empty // Fixed CS1061
            };

            return viewModel;
        }
        public static ProductViewModel ConvertEodProductViewModel(this EodhdSymbolDetail product, ProductScanResult scanResult = null, EodhdSymbol eodSymbol = null)
        {
            var viewModel = new ProductViewModel
            {
                Symbol = product.Code,
                Exchange = eodSymbol?.Exchange == null ? "AU" : eodSymbol?.Exchange,
                Name = product.Name,
                MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty,
                ClosePrice = product.Close.ToString(),
                ChangePercent = Math.Round(Convert.ToDouble(product.ChangeP), 2).ToString(),
            };

            if (scanResult != null)
            {
                viewModel.ScanDate = scanResult.ScanDate != null ? scanResult.ScanDate.Value : DateTime.MinValue;
                viewModel.ScanType = scanResult.ScanType;
                viewModel.OpenPrice = scanResult.OpenPrice.HasValue ? scanResult.OpenPrice.Value.ToString() : string.Empty;
                viewModel.StopLoss = scanResult.StopPrice.HasValue ? scanResult.StopPrice.Value.ToString() : string.Empty;
                viewModel.Volume = scanResult.Volume.HasValue ? scanResult.Volume.Value.ToString() : string.Empty;
                viewModel.Atr = scanResult.Atr.HasValue ? scanResult.Atr.Value.ToString() : string.Empty; // Fix for CS0029
            }
            return viewModel;
        }

    }
}
