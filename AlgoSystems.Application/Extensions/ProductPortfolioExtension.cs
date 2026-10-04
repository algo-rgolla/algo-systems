//using AlgoSystems.Application.Common;
//using AlgoSystems.Domain.Entities.Models;
//using BusinessObjects;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Runtime.CompilerServices;
//using System.Text;
//using System.Threading.Tasks;

//namespace AlgoSystems.Application.Extensions
//{
//    public static class ProductPortfolioExtension
//    {
//        public static ProductViewModel ConvertProductViewModel(this Product product)
//        {
//            var viewModel = new ProductViewModel
//            {
//                Symbol = product.Symbol,
//                Name = product.Name,
//                MarketCap = product.MarketCap != null ? Utils.ToKMB((decimal)product.MarketCap) : string.Empty,
//                Close = product.Close.ToString(),
//                Change = Math.Round(Convert.ToDouble(product.ChangePercent), 2).ToString(),
//                Status = Convert.ToDecimal(product.ChangePercent) > 0 ? "Up" : "Down",
//                Industry = product.Industry,
//                Sector = product.Sector
//            };

//            return  viewModel;
//        }
//    }
//}
