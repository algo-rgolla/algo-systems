using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class Watchlist
{
    public int Id { get; set; }

    public string StockCode { get; set; }

    public string StockAction { get; set; }

    public DateTime? OpenData { get; set; }

    public decimal? OpenPrice { get; set; }

    public decimal? StopPrice { get; set; }

    public string OrderStatus { get; set; }

    public long? Volume { get; set; }

    public DateTime? CloseDate { get; set; }

    public decimal? ClosePrice { get; set; }

    public string ScanType { get; set; }

    public decimal? ProfitLoss { get; set; }

    public string Comments { get; set; }

    public string BuyReason { get; set; }

    public string SellReason { get; set; }

    public decimal? Atr { get; set; }
}
