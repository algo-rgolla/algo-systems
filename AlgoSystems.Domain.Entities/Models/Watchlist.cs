using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class Watchlist
{
    public int WatchlistId { get; set; }

    public string StockCode { get; set; }

    public string StockAction { get; set; }

    public DateTime? OpenData { get; set; }

    public decimal? OpenPrice { get; set; }

    public decimal? StopPrice { get; set; }

    public string OrderStatus { get; set; }

    public int? Volume { get; set; }

    public string Comments { get; set; }

    public decimal? Atr { get; set; }
}
