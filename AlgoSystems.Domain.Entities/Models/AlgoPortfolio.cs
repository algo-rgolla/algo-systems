using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class AlgoPortfolio
{
    public int AlgoPortfolioId { get; set; }

    public string Symbol { get; set; }

    public string Action { get; set; }

    public DateTime? OpenData { get; set; }

    public double? OpenPrice { get; set; }

    public double? StopPrice { get; set; }

    public string OrderStatus { get; set; }

    public int? Volume { get; set; }

    public DateTime? CloseDate { get; set; }

    public double? ClosePrice { get; set; }

    public string ScanType { get; set; }

    public int? ProfitLoss { get; set; }

    public string Comments { get; set; }

    public string BuyReason { get; set; }

    public string SellReason { get; set; }
}
