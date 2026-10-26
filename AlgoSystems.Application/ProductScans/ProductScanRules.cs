using AlgoSystems.Application.Models;
using AlgoSystems.Common;
using EOD.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoSystems.Application.ProductScans
{
    /// <summary>
    /// The pure filters and sizing used by the daily scan batches (<c>ScanBusinessLogic</c>). The expressions are
    /// kept exactly as they were inline, including the comparisons that throw when indicator data is missing.
    /// The scan definitions themselves are in <c>ScanHelper</c>.
    /// </summary>
    public static class ProductScanRules
    {
        /// <summary>
        /// Whether an AU stock is skipped before any scan is tried. Throws when the MACD list is empty or the
        /// EMA21 or MACD list is null.
        /// </summary>
        public static bool IsExcludedFromAuScans(LiveStockPrice liveProduct, ProductTechnicalDetails technicalDetails)
        {
            return !liveProduct.Change_p.HasValue ||
                !liveProduct.Volume.HasValue ||
                liveProduct.Change_p < 1 ||
                liveProduct.Change_p > 8 ||
                liveProduct.Volume < 300000 ||
                (technicalDetails.Ema21.Count > 0 && (liveProduct.Close < technicalDetails.Ema21[^1].EMAData)) ||
                (liveProduct.Close * liveProduct.Volume) < 300000 ||
                technicalDetails.Macd[^1].Macd < technicalDetails.Macd[^1].Signal
                || technicalDetails.fiveDayPercentageGain > 25
                || technicalDetails.IsHistogramIncreasing == false;
        }

        /// <summary>Whether a US stock is skipped on its live price alone, before indicators are downloaded.</summary>
        public static bool IsExcludedFromUsScansByPrice(LiveStockPrice liveProduct)
        {
            return !liveProduct.Change_p.HasValue ||
                !liveProduct.Volume.HasValue ||
                liveProduct.Change_p < 1 ||
                liveProduct.Change_p > 10 ||
                liveProduct.Volume < 300000 ||
                (liveProduct.Close * liveProduct.Volume) < 1000000;
        }

        /// <summary>Whether a US stock is skipped on its indicators. Missing MACD or EMA21 data skips it.</summary>
        public static bool IsExcludedFromUsScansByTechnicals(LiveStockPrice liveProduct, ProductTechnicalDetails technicalDetails)
        {
            if (technicalDetails.Macd == null || technicalDetails.Macd.Count == 0)
                return true;

            if (technicalDetails.Ema21 == null || technicalDetails.Ema21.Count == 0)
                return true;

            return liveProduct.Close < technicalDetails.Ema21[^1].EMAData
                || technicalDetails.Macd[^1].Macd < technicalDetails.Macd[^1].Signal
                || technicalDetails.fiveDayPercentageGain > 25;
        }

        /// <summary>
        /// The whole-number percentage gain of the live close over the lowest close in the history, or 0 when
        /// there is no close or history or the gain is not positive.
        /// </summary>
        public static int GetFiveDayPercentageGain(List<HistoricalStockPrice> fiveDayHistory, double? close)
        {
            if (!close.HasValue || close <= 0)
                return 0;
            if (fiveDayHistory == null)
                return 0;
            if (fiveDayHistory != null && fiveDayHistory.Count == 0)
                return 0;
            double fiveDayLow = (double)fiveDayHistory.Min(x => x?.Close);
            double gain = (double)(((close - fiveDayLow) / fiveDayLow) * 100);
            return gain > 0 ? (int)Math.Round(gain) : 0;
        }

        /// <summary>
        /// Shares to buy so that a fall from the close to the stop loses <see cref="Constants.Portfolio_Position_Risk"/>.
        /// 0 when there is no close, no stop or the stop is not below the close. Rounds half to even.
        /// </summary>
        public static int GetPositionSize(decimal? close, double stopLoss)
        {
            var riskOnStock = close.HasValue && stopLoss > 0 ? close.Value - (decimal?)stopLoss : 0;
            return riskOnStock > 0 ? Convert.ToInt32(Constants.Portfolio_Position_Risk / riskOnStock) : 0;
        }
    }
}
