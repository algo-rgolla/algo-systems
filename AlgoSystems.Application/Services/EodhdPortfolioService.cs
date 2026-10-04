using AlgoSystems.Application.Common;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.BusinessObjects;
using AlgoSystems.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class EodhdPortfolioService : IEodhdPortfolioService
    {
        internal AlgoSystemsContext _dbContext;
        private readonly IUserContext _userContext;
        public EodhdPortfolioService(AlgoSystemsContext context, IUserContext userContext   )
        {
            _dbContext = context;
            _userContext = userContext;
        }

        public void ManageLongPortfolio()
        {
            // Clean Portfolio
            //TODO: Rgolla
            ClearAlgoPortfolio();

            UpdateAlgoPortfolio();
        }

        public void ManageAlgoPortfolio()
        {
            // Clean Portfolio
            ClearRealAlgoPortfolio();

            //UpdateAlgoPortfolio();
        }

        private void UpdateAlgoPortfolio()
        {
            foreach (var scan in Constants.AlgoScans)
            {
                var scanResults = _dbContext.ProductScanResults.Where(x => x.ScanType == scan).ToList();
                if (scanResults.Count > 0)
                {
                    foreach (var scanResult in scanResults)
                    {
                        var product = GetProduct(scanResult.Symbol);
                        var portfolio = _dbContext.ProductPortfolios.Where(x => x.OrderStatus == OrderStatus.OPEN
                        && x.Action == StockAction.BUY
                        && x.ScanType == scan).ToList();

                        bool isStockExist = _dbContext.ProductPortfolios.Where(x => x.OrderStatus == OrderStatus.OPEN
                        && x.Action == StockAction.BUY
                        && x.Symbol == scanResult.Symbol).Any();

                        var totalAmount = portfolio.Sum(x => x.Volume * x.OpenPrice);

                        //Check portfolio size 
                        if (totalAmount < Constants.Portfolio_Capital &&
                            !isStockExist)
                        {
                            InsertPortfolioStock(scanResult, scan, product);
                        }

                    }
                }
            }

        }

        private void InsertPortfolioStock(ProductScanResult scanResult, string scan, EodhdSymbolDetail product)
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au"))
            {
                return;
            }

            var stopLoss = Utils.GetStopLoss(product);
            var riskOnStock = (product.Close.HasValue ? (double)product.Close.Value : 0) - stopLoss; // Fix applied here  
            var volume = Convert.ToInt32(Constants.Portfolio_Position_Risk / riskOnStock);

            var portfolio = new ProductPortfolio
            {
                Symbol = scanResult.Symbol,
                Action = StockAction.BUY,
                OpenData = DateTime.Now,
                OpenPrice = (double?)product.Close,
                OrderStatus = OrderStatus.OPEN,
                Volume = Convert.ToInt32(volume),
                StopPrice = (double?)stopLoss,
                ScanType = scan,
                Comments = scan
            };
            _dbContext.ProductPortfolios.Add(portfolio);
            _dbContext.SaveChanges();
        }
        private void ClearAlgoPortfolio()
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au"))
            {
                return;
            }

            //Clean Portfolio Rules
            var openOrders = _dbContext.ProductPortfolios
                .Where(x => x.OrderStatus == OrderStatus.OPEN && x.Action.ToUpper() == ActionType.BUY)
                .ToList();

            CloseTradesWhenMatchRules(openOrders);
            _dbContext.SaveChanges();

        }
      
        private void ClearRealAlgoPortfolio()
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au"))
            {
                return;
            }

            //Clean Portfolio Rules
            var openOrders = _dbContext.AlgoPortfolios
                .Where(x => x.OrderStatus == OrderStatus.OPEN && x.Action.ToUpper() == ActionType.BUY)
                .ToList();

            foreach (AlgoPortfolio p in openOrders)
            {
                EodhdSymbolDetail product = GetProduct(p.Symbol);
                if (product != null)
                {
                    if (p.StopPrice == null || p.StopPrice == 0)
                    {
                        p.StopPrice = Utils.GetStopLoss(product);
                    }
                    //Calculate Algo Stoploss
                    bool isMetStopLoss = (decimal)p.StopPrice >= product.Close;
                    bool isEma21CrossEma63 = product.Ema21 < product.Ema63;
                    bool isPriceLessThanEma63 = (decimal)product.Close < product.Ema63;

                    int isExceededDays = Utils.DaysFromToday(p.OpenData);
                    //1. Close all stocks which meet stop losses
                    p.CloseDate = DateTime.Now;
                    p.ClosePrice = (double)product.Close;
                    p.ProfitLoss = GetAlgoProfitLoss(p, product);

                    if (isMetStopLoss || isEma21CrossEma63
                        || (isExceededDays > 10 && p.ProfitLoss < 0)
                        || (isPriceLessThanEma63 && isExceededDays > 5))
                    {
                        p.OrderStatus = OrderStatus.CLOSED;

                        if (isMetStopLoss)
                            p.SellReason = "Closed due to stock price met the stop loss";
                        else if (isExceededDays > 10 && p.ProfitLoss < 0)
                            p.SellReason = "Closed due to 10 days";
                        else if (isEma21CrossEma63)
                            p.SellReason = "Closed due to EMA21 crosses below EMA63";
                        else if (isPriceLessThanEma63 && isExceededDays > 5)
                            p.SellReason = "Closed due to price less than EMA63";
                    }

                    _dbContext.SaveChanges();
                }
            }


        }

        private void CloseTradesWhenMatchRules(List<ProductPortfolio> openOrders)
        {
            foreach (ProductPortfolio p in openOrders)
            {
                EodhdSymbolDetail product = GetProduct(p.Symbol);
                if (product != null)
                {
                    bool isMetStopLoss = (decimal)p.StopPrice >= product.Close;
                    bool isEma21CrossEma63 = product.Ema21 < product.Ema63;
                    bool isPriceLessThanEma63 = (decimal)product.Close < product.Ema63;

                    int isExceededDays = Utils.DaysFromToday(p.OpenData);
                    //1. Close all stocks which meet stop losses
                    p.CloseDate = DateTime.Now;
                    p.ClosePrice = (double)product.Close;
                    p.ProfitLoss = GetProfitLoss(p, product);

                    if (isMetStopLoss || isEma21CrossEma63 
                        || (isExceededDays > 10 && p.ProfitLoss < 0)
                        || (isPriceLessThanEma63 && isExceededDays > 5))
                    {
                        p.OrderStatus = OrderStatus.CLOSED;

                        if (isMetStopLoss)
                            p.SellReason = "Closed due to stock price met the stop loss";
                        
                        if (isExceededDays > 10 && p.ProfitLoss < 0)
                            p.SellReason = "Closed due to 10 days";

                        if (isEma21CrossEma63)
                            p.SellReason = "Closed due to EMA21 crosses below EMA63";

                        if (isPriceLessThanEma63 && isExceededDays > 5)
                            p.SellReason = "Closed due to price less than EMA63";
                    }

                }
            }

        }
        private int GetProfitLoss(ProductPortfolio p, EodhdSymbolDetail product)
        {
            try
            {
                // Ensure both operands are of the same type by casting 'product.Close' to double  
                return Convert.ToInt32(((double?)product.Close * p.Volume) - (p.OpenPrice * p.Volume));
            }
            catch
            {
                return 0;
            }
        }
        private int GetAlgoProfitLoss(AlgoPortfolio p, EodhdSymbolDetail product)
        {
            try
            {
                // Ensure both operands are of the same type by casting 'product.Close' to double  
                return Convert.ToInt32(((double?)product.Close * p.Volume) - (p.OpenPrice * p.Volume));
            }
            catch
            {
                return 0;
            }
        }

        public async Task<ProductsViewModel> GetAlgoPortfolioHistory(PortfolioViewModel request)
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();

            var portfolioList = await _dbContext.AlgoPortfolios.Where(x => x.OrderStatus == OrderStatus.CLOSED
            && x.Action == ActionType.BUY).ToListAsync();


            foreach (var portfolio in portfolioList)
            {
                var product = GetProduct(portfolio.Symbol);
                if (product != null)
                {
                    var productViewModel = GetAlgoProductHistoryViewModel(product, portfolio);
                    model.Products.Add(productViewModel);
                }
            }

            return model;
        }
        public async Task<ProductsViewModel> GetPortfolioHistory(PortfolioViewModel request)
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();

            var portfolioList = await _dbContext.ProductPortfolios.Where(x => x.OrderStatus == OrderStatus.CLOSED
            && x.Action == ActionType.BUY
            && x.ScanType == request.ScanName).ToListAsync();


            foreach (var portfolio in portfolioList)
            {
                var product = GetProduct(portfolio.Symbol);
                if (product != null)
                {
                    var productViewModel = GetProductHistoryViewModel(product, portfolio);
                    model.Products.Add(productViewModel);
                }
            }

            return model;
        }

        public async Task<ProductsViewModel> GetAlgoPortfolio(PortfolioViewModel request)
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();
            //await Utils.LogUserDetails(_dbContext, _userContext);

            var portfolioList = await _dbContext.ProductPortfolios.Where(x => x.OrderStatus == OrderStatus.OPEN
            && x.Action == ActionType.BUY
            && x.ScanType == request.ScanName)
                .OrderByDescending(x => x.OpenData)
                .ToListAsync();


            foreach (var portfolio in portfolioList)
            {
                var product = GetProduct(portfolio.Symbol);
                if (product != null)
                {
                    var productViewModel = GetProductViewModel(product, portfolio);
                    model.Products.Add(productViewModel);
                }
            }

            return model;
        }

        public async Task<ProductsViewModel> GetRealAlgoPortfolio()
        {
            var model = new ProductsViewModel();
            model.Products = new List<ProductViewModel>();

            var portfolioList = _dbContext.AlgoPortfolios.Where(x => x.OrderStatus != "Closed").ToList();


            foreach (var portfolio in portfolioList)
            {
                var product = GetProduct(portfolio.Symbol);
                if (product != null)
                {
                    var productViewModel = GetProductViewFromAlgoModel(product, portfolio);
                    model.Products.Add(productViewModel);
                }
            }

            return model;
        }

        private ProductViewModel GetProductViewModel(EodhdSymbolDetail product, ProductPortfolio portfolio)
        {
            var changePercent = product.ChangeP;

            var model = new ProductViewModel();
            model.PortfolioId = portfolio.Id;
            model.Symbol = product.Code;
            model.Exchange = "ASX";
            model.Name = product.Name;
            model.Status = Convert.ToDecimal(changePercent) > 0 ? "Up" : "Down";
            model.MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty;
            model.Volume = portfolio.Volume.ToString();
            if (portfolio.OpenPrice != null)
                model.OpenPrice = Math.Round(Convert.ToDecimal(portfolio.OpenPrice), 2).ToString();
            model.Close = product.Close.ToString();
            model.ChangePercent = Math.Round(Convert.ToDouble(changePercent), 2).ToString();
            model.OpenDate = Convert.ToDateTime(portfolio.OpenData).ToString("dd-MM-yyyy");
            int profitLoss = CalculateProfitLoss((decimal?)portfolio.OpenPrice, (decimal?)product.Close, portfolio.Volume);
            if (portfolio.ProfitLoss != null)
            {
                model.ProfitLoss = Math.Round(Convert.ToDecimal(portfolio.ProfitLoss), 2).ToString();
            }
            else
            {
                model.ProfitLoss = profitLoss.ToString();
            }
            if (portfolio.ClosePrice != null)
                model.ClosePrice = portfolio.ClosePrice.ToString();

            if (portfolio.CloseDate != null)
            {
                model.CloseDate = Convert.ToDateTime(portfolio.CloseDate).ToString("dd-MM-yyyy");
            }

            if (Convert.ToDecimal(changePercent) > 0)
            {
                model.Status = "Up";
            }
            else if (Convert.ToDecimal(changePercent) < 0)
            {
                model.Status = "Down";
            }
            else
            {
                model.Status = "NoChange";
            }
            model.TradeDays = Convert.ToInt32((DateTime.Today - Convert.ToDateTime(portfolio.OpenData)).TotalDays).ToString();
            model.Comments = portfolio.Comments;
            model.BuyReason = portfolio.BuyReason;
            model.SellReason = portfolio.SellReason;
            if (portfolio.StopPrice != null)
            {
                model.StopLoss = Math.Round(Convert.ToDecimal(portfolio.StopPrice), 2).ToString();
            }

            return model;
        }

        private ProductViewModel GetProductViewFromAlgoModel(EodhdSymbolDetail product, AlgoPortfolio portfolio)
        {
            var changePercent = product.ChangeP;

            var model = new ProductViewModel();
            model.PortfolioId = portfolio.AlgoPortfolioId; // Updated
            model.Symbol = product.Code;
            model.Exchange = "ASX";
            model.Name = product.Name;
            model.Status = Convert.ToDecimal(changePercent) > 0 ? "Up" : "Down";
            model.MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty;
            model.Volume = portfolio.Volume.ToString();
            if (portfolio.OpenPrice != null)
                model.OpenPrice = Math.Round(Convert.ToDecimal(portfolio.OpenPrice), 2).ToString();
            model.Close = product.Close.ToString();
            model.ChangePercent = Math.Round(Convert.ToDouble(changePercent), 2).ToString();
            model.OpenDate = Convert.ToDateTime(portfolio.OpenData).ToString("dd-MM-yyyy");
            int profitLoss = CalculateProfitLoss((decimal?)portfolio.OpenPrice, (decimal?)product.Close, portfolio.Volume);
            if (portfolio.ProfitLoss != null)
            {
                model.ProfitLoss = Math.Round(Convert.ToDecimal(portfolio.ProfitLoss), 2).ToString();
            }
            else
            {
                model.ProfitLoss = profitLoss.ToString();
            }
            if (portfolio.ClosePrice != null)
                model.ClosePrice = portfolio.ClosePrice.ToString();

            if (portfolio.CloseDate != null)
            {
                model.CloseDate = Convert.ToDateTime(portfolio.CloseDate).ToString("dd-MM-yyyy");
            }

            if (Convert.ToDecimal(changePercent) > 0)
            {
                model.Status = "Up";
            }
            else if (Convert.ToDecimal(changePercent) < 0)
            {
                model.Status = "Down";
            }
            else
            {
                model.Status = "NoChange";
            }
            model.TradeDays = Convert.ToInt32((DateTime.Today - Convert.ToDateTime(portfolio.OpenData)).TotalDays).ToString();
            model.Comments = portfolio.Comments;
            model.BuyReason = portfolio.BuyReason;
            model.SellReason = portfolio.SellReason;
            if (portfolio.StopPrice != null)
            {
                model.StopLoss = Math.Round(Convert.ToDecimal(portfolio.StopPrice), 2).ToString();
            }

            return model;
        }

        private ProductViewModel GetProductHistoryViewModel(EodhdSymbolDetail product, ProductPortfolio portfolio)
        {
            var changePercent = (portfolio.OpenPrice - portfolio.ClosePrice)/100;

            var model = new ProductViewModel();
            model.Id = portfolio.Id;
            model.PortfolioId = portfolio.Id;
            model.Symbol = product.Code;
            model.Exchange = "ASX";
            model.Name = product.Name;
            model.Status = Convert.ToDecimal(changePercent) > 0 ? "Up" : "Down";
            //model.Industry = product.Industry;
            //model.Sector = product.Sector;
            model.MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty;
            model.Volume = portfolio.Volume.ToString();
            if (portfolio.OpenPrice != null)
                model.OpenPrice = Math.Round(Convert.ToDecimal(portfolio.OpenPrice), 2).ToString();
            model.Close = portfolio.ClosePrice.ToString();
            model.ChangePercent = Math.Round(Convert.ToDouble(changePercent), 2).ToString();
            model.OpenDate = Convert.ToDateTime(portfolio.OpenData).ToString("dd-MM-yyyy");
            int profitLoss = CalculateProfitLoss((decimal?)portfolio.OpenPrice, (decimal?)portfolio.ClosePrice, portfolio.Volume);
            if (portfolio.ProfitLoss != null)
            {
                model.ProfitLoss = Math.Round(Convert.ToDecimal(portfolio.ProfitLoss), 2).ToString();
            }
            else
            {
                model.ProfitLoss = profitLoss.ToString();
            }
            if (portfolio.ClosePrice != null)
                model.ClosePrice = portfolio.ClosePrice.ToString();

            //TODO: Market Cap to be displayed.
            //model.MarketCap = Convert.ToString(product.MarketCapital);

            if (portfolio.CloseDate != null)
            {
                model.CloseDate = Convert.ToDateTime(portfolio.CloseDate).ToString("dd-MM-yyyy");
            }

            if (Convert.ToDecimal(changePercent) > 0)
            {
                model.Status = "Up";
            }
            else if (Convert.ToDecimal(changePercent) < 0)
            {
                model.Status = "Down";
            }
            else
            {
                model.Status = "NoChange";
            }
            string comments = string.Empty;
            //model.Action = GetActionToTake(portfolio, stockHistory, profitLoss, ref comments);
            model.TradeDays = Convert.ToInt32((DateTime.Today - Convert.ToDateTime(portfolio.OpenData)).TotalDays).ToString();
            model.Comments = portfolio.Comments;
            //if (product != null)
            //{
            //    model.Sector = product.Sector;
            //    model.SecurityType = product.StockType;
            //}

            model.BuyReason = portfolio.BuyReason;
            model.SellReason = portfolio.SellReason;
            if (portfolio.StopPrice != null)
            {
                model.StopLoss = Math.Round(Convert.ToDecimal(portfolio.StopPrice), 2).ToString();
            }


            return model;
        }
        private ProductViewModel GetAlgoProductHistoryViewModel(EodhdSymbolDetail product, AlgoPortfolio portfolio)
        {
            var changePercent = (portfolio.OpenPrice - portfolio.ClosePrice) / 100;

            var model = new ProductViewModel();
            model.Id = portfolio.AlgoPortfolioId;
            model.PortfolioId = portfolio.AlgoPortfolioId;
            model.Symbol = product.Code;
            model.Exchange = "ASX";
            model.Name = product.Name;
            model.Status = Convert.ToDecimal(changePercent) > 0 ? "Up" : "Down";
            //model.Industry = product.Industry;
            //model.Sector = product.Sector;
            model.MarketCap = product.MarketCapitalization != null ? Utils.ToKMB((decimal)product.MarketCapitalization) : string.Empty;
            model.Volume = portfolio.Volume.ToString();
            if (portfolio.OpenPrice != null)
                model.OpenPrice = Math.Round(Convert.ToDecimal(portfolio.OpenPrice), 2).ToString();
            model.Close = portfolio.ClosePrice.ToString();
            model.ChangePercent = Math.Round(Convert.ToDouble(changePercent), 2).ToString();
            model.OpenDate = Convert.ToDateTime(portfolio.OpenData).ToString("dd-MM-yyyy");
            int profitLoss = CalculateProfitLoss((decimal?)portfolio.OpenPrice, (decimal?)portfolio.ClosePrice, portfolio.Volume);
            if (portfolio.ProfitLoss != null)
            {
                model.ProfitLoss = Math.Round(Convert.ToDecimal(portfolio.ProfitLoss), 2).ToString();
            }
            else
            {
                model.ProfitLoss = profitLoss.ToString();
            }
            if (portfolio.ClosePrice != null)
                model.ClosePrice = portfolio.ClosePrice.ToString();

            //TODO: Market Cap to be displayed.
            //model.MarketCap = Convert.ToString(product.MarketCapital);

            if (portfolio.CloseDate != null)
            {
                model.CloseDate = Convert.ToDateTime(portfolio.CloseDate).ToString("dd-MM-yyyy");
            }

            if (Convert.ToDecimal(changePercent) > 0)
            {
                model.Status = "Up";
            }
            else if (Convert.ToDecimal(changePercent) < 0)
            {
                model.Status = "Down";
            }
            else
            {
                model.Status = "NoChange";
            }
            string comments = string.Empty;
            //model.Action = GetActionToTake(portfolio, stockHistory, profitLoss, ref comments);
            model.TradeDays = Convert.ToInt32((DateTime.Today - Convert.ToDateTime(portfolio.OpenData)).TotalDays).ToString();
            model.Comments = portfolio.Comments;
            //if (product != null)
            //{
            //    model.Sector = product.Sector;
            //    model.SecurityType = product.StockType;
            //}

            model.BuyReason = portfolio.BuyReason;
            model.SellReason = portfolio.SellReason;
            if (portfolio.StopPrice != null)
            {
                model.StopLoss = Math.Round(Convert.ToDecimal(portfolio.StopPrice), 2).ToString();
            }


            return model;
        }

        private int CalculateProfitLoss(decimal? openPrice, decimal? closePrice, int? tradeSize)
        {
            if (openPrice.HasValue && closePrice.HasValue && tradeSize.HasValue)
            {
                return Convert.ToInt32((closePrice.Value - openPrice.Value) * tradeSize.Value);
            }
            return 0;
        }

        private EodhdSymbolDetail GetProduct(string code)
        {
            code = code.Contains(".AU") ? code.Replace(".AU", "") : code;
            return _dbContext.EodhdSymbolDetails.Where(x => x.Code == code && x.ExchangeShortName == "AU").FirstOrDefault();
        }

        public async Task<StatisticsResponseDto> GetPortfolioStatistics(StatisticsRequestDto request)
        {
            var model = new StatisticsResponseDto();
            model.Statistics = new List<StatisticItemDto>();
            model.ScanType = request.ScanName;
            //await Utils.LogUserDetails(_dbContext, _userContext);

            var portfolioList = await _dbContext.ProductPortfolios.Where(x => x.ScanType == request.ScanName)
                .ToListAsync();

            //Realised Profit
            int realisedProfit = portfolioList.Where(x => x.OrderStatus == OrderStatus.CLOSED && x.ProfitLoss > 0).Sum(x => x.ProfitLoss) ?? 0;
            int realisedLoss = portfolioList.Where(x => x.OrderStatus == OrderStatus.CLOSED && x.ProfitLoss < 0).Sum(x => x.ProfitLoss) ?? 0;
            int currentProfit = portfolioList.Where(x => x.OrderStatus == OrderStatus.OPEN && x.ProfitLoss > 0).Sum(x => x.ProfitLoss) ?? 0;
            int currentLoss = portfolioList.Where(x => x.OrderStatus == OrderStatus.OPEN && x.ProfitLoss < 0).Sum(x => x.ProfitLoss) ?? 0;

            model.Statistics.Add(new StatisticItemDto { StatisticLabel = "Realised Profit", StatisticValue = Math.Abs(realisedProfit) });
            model.Statistics.Add(new StatisticItemDto { StatisticLabel = "Realised Loss", StatisticValue = Math.Abs(realisedLoss) });
            model.Statistics.Add(new StatisticItemDto { StatisticLabel = "Current Profit", StatisticValue = Math.Abs(currentProfit) });
            model.Statistics.Add(new StatisticItemDto { StatisticLabel = "Current Loss", StatisticValue = Math.Abs(currentLoss) });

            return model;
        }

        public async Task<bool> CreatePortfolioAsync(CreatePortfolioRequestDto request)
        {
            string email = _userContext.Email;
            if (string.IsNullOrEmpty(email) || email != "madhu@gmail.com")
            {
                return false;
            }   

            var portfolio = new ProductPortfolio
            {
                Symbol = request.Symbol,
                Action = request.Action,
                OpenPrice = request.OpenPrice,
                Volume = request.Volume,
                ScanType = Scans.AlgoPortfolio,
                OpenData = DateTime.Now
            };

            _dbContext.ProductPortfolios.Add(portfolio);
            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> AddOrEditAlgoPortfolioAsync(AlgoProductViewModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Symbol) || model.Symbol.Length != 3)
                return false;
            if (model.Action != "Buy" && model.Action != "Sell")
                return false;
            if (!model.OpenPrice.HasValue || model.OpenPrice <= 0)
                return false;

            AlgoPortfolio entity = null;
            if (model.AlgoPortfolioId > 0)
            {
                entity = await _dbContext.AlgoPortfolios.FindAsync(model.AlgoPortfolioId);
            }

            if (entity == null)
            {
                entity = new AlgoPortfolio();
                _dbContext.AlgoPortfolios.Add(entity);
                entity.OpenData = DateTime.Now;
            }

            entity.Symbol = model.Symbol;
            entity.Action = model.Action;
            entity.Volume = model.Volume;
            // Only set the required fields
            if (model.Action == "Buy")
            {
                entity.OpenPrice = model.OpenPrice; // Set OpenPrice
                entity.OrderStatus = OrderStatus.OPEN;
            }
            else if (model.Action == "Sell")
            {
                entity.ClosePrice = model.ClosePrice; // Set OpenPrice
                entity.OrderStatus = OrderStatus.CLOSED;
            }

            return await _dbContext.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAlgoPortfolioAsync(int algoPortfolioId)
        {
            var entity = await _dbContext.AlgoPortfolios.FindAsync(algoPortfolioId);
            if (entity == null)
                return false;
            entity.OrderStatus = "Archived";
            //_dbContext.AlgoPortfolios.Remove(entity);
            await _dbContext.SaveChangesAsync();
            return true;
        }

    }
}
