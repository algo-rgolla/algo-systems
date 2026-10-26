using System.Globalization;
using AlgoSystems.Application.Models;
using EOD.Model;
using EOD.Model.TechnicalIndicators;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace AlgoSystems.Test.ProductScans
{
    /// <summary>Builders for the EODHD models the scan rules read.</summary>
    internal static class ScanTestData
    {
        /// <summary>
        /// LiveStockPrice only takes values through JSON (its setters are no-ops); a value left out reads as 0.
        /// </summary>
        public static LiveStockPrice Live(double? close = 10, double? volume = 500_000, double? changeP = 3, double? previousClose = 9.7)
        {
            var json = new JObject();
            Add(json, "Close", close);
            Add(json, "Volume", volume);
            Add(json, "Change_p", changeP);
            Add(json, "PreviousClose", previousClose);
            return JsonConvert.DeserializeObject<LiveStockPrice>(json.ToString())!;
        }

        public static List<EMA> Emas(params double?[] values)
            => values.Select((v, i) => new EMA { Date = new DateTime(2026, 10, 1).AddDays(i), EMAData = v }).ToList();

        public static List<MovingAverageConvergence> Macds(params (double? Macd, double? Signal, double? Divergence)[] values)
            => values.Select((v, i) => new MovingAverageConvergence
            {
                Date = new DateTime(2026, 10, 1).AddDays(i),
                Macd = v.Macd,
                Signal = v.Signal,
                Divergence = v.Divergence,
            }).ToList();

        public static ProductTechnicalDetails Technicals(
            double? ema21 = 9, double? macd = 0.2, double? signal = 0.1, int fiveDayGain = 5, bool histogramIncreasing = true)
            => new()
            {
                Ema21 = Emas(ema21),
                Macd = Macds((macd, signal, 0.1)),
                fiveDayPercentageGain = fiveDayGain,
                IsHistogramIncreasing = histogramIncreasing,
            };

        public static List<HistoricalStockPrice> History(params double?[] closes)
            => closes.Select(c => new HistoricalStockPrice { Close = c }).ToList();

        private static void Add(JObject json, string name, double? value)
        {
            if (value.HasValue)
                json[name] = value.Value.ToString(CultureInfo.CurrentCulture);
        }
    }
}
