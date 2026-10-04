namespace BusinessObjects
{
    public class AlgoProductViewModel
    {
        public int AlgoPortfolioId { get; set; }
        public string Symbol { get; set; } // 3 characters
        public int Volume { get; set; }
        public string Action { get; set; } // "Buy" or "Sell"
        public double? OpenPrice { get; set; } // Added for open stock price
        public double? ClosePrice { get; set; } // Added for open stock price

    }
}
