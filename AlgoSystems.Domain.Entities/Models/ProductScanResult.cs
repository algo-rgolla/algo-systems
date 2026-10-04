using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class ProductScanResult
{
    public int Id { get; set; }

    public DateTime? ScanDate { get; set; }

    public string ScanType { get; set; }

    public string Symbol { get; set; }

    public string Exchange { get; set; }

    public string Description { get; set; }

    public decimal? OpenPrice { get; set; }

    public decimal? StopPrice { get; set; }

    public long? Volume { get; set; }

    public decimal? Atr { get; set; }
}
