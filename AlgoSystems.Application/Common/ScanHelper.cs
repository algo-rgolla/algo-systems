using AlgoSystems.Application.Models;
using AlgoSystems.Domain.Entities.Models;
using EOD.Model;
using EOD.Model.TechnicalIndicators;
using System;
using System.Collections.Generic;
using EODModel = EOD.Model.TechnicalIndicators;

namespace AlgoSystems.BusinessLogic.Common
{
    internal static class ScanHelper
    {
        internal static DateTime? GetEMACrossOverDate(List<EODModel.EMA> ema21, List<EODModel.EMA> ema63)
        {
            if (ema21 == null || ema63 == null)
                return null;

            for(int i = 1; i < Math.Min(ema21.Count, ema63.Count); i++)
            {
                if(ema21[^i].EMAData > ema63[^i].EMAData &&
                   ema21[^(i + 1)].EMAData < ema63[^(i + 1)].EMAData)
                {
                    return ema21[i].Date;
                }
            }
            return null;
        }
        internal static bool IsEmaCrossover(List<EODModel.EMA> ema21, List<EODModel.EMA> ema63, List<EODModel.EMA> ema125)
        {
            bool IsEmaCrossover = false;

            try
            {
                //EMA Crossover
                if (ema21.Count > 0 && ema63.Count > 0
                    && (ema21[^1].EMAData > ema63[^1].EMAData)
                    && (ema63[^1].EMAData > ema125[^1].EMAData)
                    && (
                    ema21[^2].EMAData < ema63[^2].EMAData
                    || ema21[^3].EMAData < ema63[^3].EMAData
                    )
                    )
                {
                    IsEmaCrossover = true;
                }
            }
            catch { }

            return IsEmaCrossover;
        }

       internal static bool IsBigGainers(LiveStockPrice liveProduct, ProductTechnicalDetails technicalDetails, EodhdSymbolDetail product)
        {
            bool IsBigGainers = false;

            try
            {
                //Big Gainers
                if ((liveProduct.Close > technicalDetails.Ema21[^1].EMAData &&
                        liveProduct.Change_p > 2 &&
                        (technicalDetails.Ema21[^1].EMAData > technicalDetails.Ema63[^1].EMAData) &&
                        (technicalDetails.Ema63[^1].EMAData > technicalDetails.Ema125[^1].EMAData)
                        ) &&
                        (
                            liveProduct.Close > liveProduct.PreviousClose
                        ) 
                        &&
                        (
                            product.Macd > 0 // Explicitly cast 'product.Avgvol50d' to 'double?'
                        )
                        &&
                        (
                            technicalDetails.IsHistogramIncreasing
                        )
                        && IsEma21Ema63Closer(technicalDetails.Ema21, technicalDetails.Ema63)
                        && (
                            liveProduct.Volume > ((double?)product.Avgvol50d) // Explicitly cast 'product.Avgvol50d' to 'double?'
                        )
                        )
                {
                    IsBigGainers = true;
                }
            }
            catch
            {

            }
            return IsBigGainers;
        }

        private static bool IsEma21Ema63Closer(List<EMA> ema21List, List<EMA> ema63List)
        {
            double? ema21 = ema21List[^1].EMAData;
            double? ema63 = ema63List[^1].EMAData;

            if (ema21 == null || ema63 == null)
                return false;

            if (ema63 == 0)
                return false; // avoid division by zero

            double percentDiff = (Math.Abs(ema21.Value - ema63.Value) / ema63.Value) * 100.0;
            return percentDiff < 5.0;
        }

        public static bool IsValidEmaDistance(decimal? ema21, decimal? ema63)
        {
            if (ema21 == null || ema63 == null)
                return false;

            if (ema63 == 0)
                return false; // avoid division by zero

            decimal percentDiff = (decimal)(Math.Abs((decimal)(ema21 - ema63)) / ema63 * 100m);
            return percentDiff < 2m;
        }


        internal static bool IsUnusualVolume(LiveStockPrice liveproduct,
            EodhdSymbolDetail product,
            List<EODModel.EMA> ema21, List<EODModel.EMA> ema63, List<EODModel.EMA> ema125)
        {
            bool IsUnusualVolume = false;

            try
            {
                //Big Gainers
                if ((liveproduct.Close > ema21[^1].EMAData &&
                        ema21[^1].EMAData > ema63[^1].EMAData &&
                        liveproduct.Change_p > 2 &&
                        (
                            liveproduct.Volume > ((double?)product.Avgvol50d * 2.5) // Explicitly cast 'product.Avgvol50d' to 'double?'
                        )))
                {
                    IsUnusualVolume = true;
                }
            }
            catch
            {

            }
            return IsUnusualVolume;
        }

        internal static bool IsUS_UnusualVolume(LiveStockPrice liveproduct,
    EodhdSymbolDetail product,
    ProductTechnicalDetails technicalDetails)
        {
            bool IsUnusualVolume = false;

            try
            {
                if ((liveproduct.Close > technicalDetails.Ema21[^1].EMAData &&
                        technicalDetails.Ema21[^1].EMAData > technicalDetails.Ema63[^1].EMAData &&
                        liveproduct.Change_p > 1 &&
                        (
                            liveproduct.Volume > ((double?)product.Avgvol50d) // Explicitly cast 'product.Avgvol50d' to 'double?'
                        )) &&
                        (technicalDetails.IsHistogramIncreasing) &&
                         IsEma21Ema63Closer(technicalDetails.Ema21, technicalDetails.Ema63)
                        ) 
                {
                    IsUnusualVolume = true;
                }
            }
            catch
            {

            }
            return IsUnusualVolume;
        }
        //internal static bool IsMacdHistogramIncreasing(List<MovingAverageConvergence> macd)
        //{
        //    if (macd == null || macd.Count < 3)
        //        return false;

        //    // Take the last 3 objects
        //    var last3 = macd.GetRange(macd.Count - 3, 3);
        //    var hist1 = (last3[0].Macd ?? 0) - (last3[0].Signal ?? 0);
        //    var hist2 = (last3[1].Macd ?? 0) - (last3[1].Signal ?? 0);
        //    var hist3 = (last3[2].Macd ?? 0) - (last3[2].Signal ?? 0);

        //    // Check if strictly increasing
        //    return hist1 < hist2 && hist2 < hist3;
        //}

        internal static bool IsHistogramIncreasing(List<MovingAverageConvergence> macd)
        {
            if (macd == null || macd.Count < 3)
                return false;

            // Take the last 3 objects
            var day1 = macd[^1].Divergence;
            var day2 = macd[^2].Divergence;
            var day3 = macd[^3].Divergence;

            // Check if strictly increasing
            return (day1 > day2 && day2 > day3);
        }

    }
}
