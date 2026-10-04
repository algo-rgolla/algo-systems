using AlgoSystems.Application.Extensions;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Common;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class SearchService : ISearchService
    {
        private readonly AlgoSystemsContext _dbContext;
        public SearchService(AlgoSystemsContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<SearchViewModel> GetEodhdProducts(string asxType = "")
        {
            var gearedEtfList = new[] { "GEAR", "GGUS", "G200", "GMVW", "BBOZ", "SNAS", "AUDS", "YANK" };
            var model = new SearchViewModel();
            if (asxType == "etf")
            {
                var products = await _dbContext.EodhdSymbolDetails.Where(x => x.Type == "ETF" && x.MarketCapitalization > Constants.ETF_MarketCap).ToListAsync();
                products = products.OrderByDescending(x => x.MarketCapitalization).ToList();

                model.Products = products.Select(x => x.ConvertEodProductViewModel()).ToList();
            }
            else if (asxType == "geardetf")
            {
                var products = await _dbContext.EodhdSymbolDetails.Where(x => x.Type == "ETF" &&
                gearedEtfList.Contains(x.Code)).ToListAsync();
                products = products.OrderByDescending(x => x.MarketCapitalization).ToList();

                model.Products = products.Select(x => x.ConvertEodProductViewModel()).ToList();
            }
            else
            {
                var products = await _dbContext.EodhdSymbolDetails.Where(x => x.Type == "Common Stock" && x.Code.Length == 3 && x.ExchangeShortName == "AU").ToListAsync();
                int count = GetAsxCountByType(asxType);
                if (count > 0)
                    products = products.OrderByDescending(x => x.MarketCapitalization).Take(count).ToList();

                model.Products = products.Select(x => x.ConvertEodProductViewModel()).ToList();
            }

            return model;
        }

        private int GetAsxCountByType(string asxType)
        {
            var count = 0;
            switch (asxType)
            {
                case "asx20":
                    return 20;
                case "asx50":
                    return 50;
                case "asx100":
                    return 100;
                case "asx200":
                    return 200;
                case "asx300":
                    return 300;

            }

            return count;
        }
    }

}
