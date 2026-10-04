using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class EodhdSymbolDetail
{
    public int Id { get; set; }

    public string Code { get; set; }

    public string Name { get; set; }

    public string Type { get; set; }

    public string ExchangeShortName { get; set; }

    public long? MarketCapitalization { get; set; }

    public double? Beta { get; set; }

    public DateOnly? Date { get; set; }

    public decimal? Open { get; set; }

    public decimal? High { get; set; }

    public decimal? Low { get; set; }

    public decimal? Close { get; set; }

    public decimal? AdjustedClose { get; set; }

    public long? Volume { get; set; }

    public decimal? Ema50d { get; set; }

    public decimal? Ema200d { get; set; }

    public decimal? Hi250d { get; set; }

    public decimal? Lo250d { get; set; }

    public decimal? PrevClose { get; set; }

    public decimal? Change { get; set; }

    public decimal? ChangeP { get; set; }

    public decimal? Avgvol14d { get; set; }

    public decimal? Avgvol50d { get; set; }

    public decimal? Avgvol200d { get; set; }

    public decimal? Ema21 { get; set; }

    public decimal? Ema63 { get; set; }

    public decimal? Ema125 { get; set; }

    public decimal? Macd { get; set; }

    public decimal? SignalLine { get; set; }

    public decimal? Atr { get; set; }

    public int? FiveDayGainPercent { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public DateTime? EmacrossOverDate { get; set; }

    public bool? IsHistogramIncreasing { get; set; }
}
