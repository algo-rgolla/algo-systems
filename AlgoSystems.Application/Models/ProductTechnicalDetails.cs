using System.Collections.Generic;
using EOD.Model.TechnicalIndicators;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AlgoSystems.Application.Models
{
    public class ProductTechnicalDetails
    {
        public List<EMA> Ema21 { get; set; }
        public List<EMA> Ema63 { get; set; }
        public List<EMA> Ema125 { get; set; }
        public List<MovingAverageConvergence> Macd { get; set; }
        public List<AverageTrueRange> Atr { get; set; }
        //public decimal FiveDayMax { get; set; }
        public bool IsHistogramIncreasing { get; set; } = false;
        public int fiveDayPercentageGain { get; set; } = 0;
    }
}
