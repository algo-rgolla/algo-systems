namespace BusinessObjects
{
    public class ProductViewModel
    {
        public int Id { get; set; } 
        public int PortfolioId { get; set; }
        public string Symbol { get; set; }
        public string Exchange { get; set; }
        public string Name { get; set; }
        public string Volume { get; set; }
        public string OpenPrice { get; set; }
        public string OpenDate { get; set; }
        public string CloseDate { get; set; }
        public string Close { get; set; }
        public string Change { get; set; }        
        public string ClosePrice { get; set; }
        public string ChangePercent { get; set; }
        public string Status { get; set; }
        public string? MarketCap { get; set; }
        public string Industry { get; set; }
        public string Sector { get; set; }

        public string ProfitLoss { get; set; }
        public string Comments { get; set; }
        public string TradeDays { get; set; }
        public string SellReason { get; set; }
        public string BuyReason { get; set; }
        public string StopLoss { get; set; }
        //WatchList
        public DateTime ScanDate { get; set; }
        public string ScanType { get; set; }
        public string Atr { get; set; }
        public string Action { get; set; } // Added for AlgoPortfolio API

    }
}
