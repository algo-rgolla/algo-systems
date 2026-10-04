using System;
using System.Collections.Generic;

namespace AlgoSystems.Domain.Entities.Models;

public partial class Product
{
    public int Id { get; set; }

    public string Symbol { get; set; }

    public string Exchange { get; set; }

    public string Name { get; set; }

    public string Description { get; set; }

    public DateOnly? StockDate { get; set; }

    public double? OpenPrice { get; set; }

    public double? HighPrice { get; set; }

    public double? LowPrice { get; set; }

    public double? Close { get; set; }

    public long? Volume { get; set; }

    public long? OpenIntrest { get; set; }

    public double? Previous { get; set; }

    public double? Change { get; set; }

    public double? ChangePercent { get; set; }

    public double? Big { get; set; }

    public double? Ask { get; set; }

    public double? PreviousClose { get; set; }

    public double? NextOpen { get; set; }

    public string ChartUrl { get; set; }

    public string Industry { get; set; }

    public string Sector { get; set; }

    public long? Shares { get; set; }

    public long? MarketCap { get; set; }

    public double? Pe { get; set; }

    public double? Eps { get; set; }

    public double? WeekChange { get; set; }

    public double? MonthChange { get; set; }

    public double? YearChange { get; set; }

    public double? AvgWeekVolume { get; set; }

    public double? AvgMonthVolume { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime UpdatedDate { get; set; }

    public string UpdatedBy { get; set; }

    public byte[] RowVersion { get; set; }

    public string Isincode { get; set; }

    public string DescriptionFull { get; set; }

    public double? BidPrice { get; set; }

    public double? OfferPrice { get; set; }

    public double? PreviousDayPercentageChange { get; set; }

    public double? YearHighPrice { get; set; }

    public double? LastTradePrice { get; set; }

    public DateOnly? YearHighDate { get; set; }

    public DateOnly? LastTradeDate { get; set; }

    public double? YearLowPrice { get; set; }

    public DateOnly? YearLowDate { get; set; }

    public double? YearOpenPrice { get; set; }

    public DateOnly? YearOpenDate { get; set; }

    public double? YearChangePrice { get; set; }

    public double? YearChangeInPercentage { get; set; }

    public long? AverageDailyVolumn { get; set; }

    public double? AnnualDividentYield { get; set; }

    public long? DeprecatedMarketCap { get; set; }

    public long? DeprecatedNumberOfShares { get; set; }

    public bool? Suspended { get; set; }
}
