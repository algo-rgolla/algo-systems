using AlgoSystems.Common;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AlgoSystems.Application.ProductScans
{
    /// <summary>
    /// The scans shown on the scan counters, with their display labels. Other scan types (for example
    /// <see cref="Scans.Long_CFD_US_UnusualVolume"/>) are not counted.
    /// </summary>
    public static class ProductScanCatalog
    {
        private static readonly (string ScanType, string Label)[] CounterLabels =
        {
            (Scans.LongEMACrossover, "EMA Crossover"),
            (Scans.LongUnusualVolume, "Unusual Volume"),
            (Scans.LongBigGainers, "Big Gainers"),
            (Scans.Long_CFD_US_BigGainers, "US Big Gainers"),
            (Scans.Short_CFD_US_BigLoosers, "US Big Loosers"),
        };

        private static readonly Dictionary<string, string> LabelsByScanType =
            CounterLabels.ToDictionary(x => x.ScanType, x => x.Label, StringComparer.Ordinal);

        public static readonly string[] CounterScanTypes = CounterLabels.Select(x => x.ScanType).ToArray();

        /// <summary>Matches the scan type exactly (ordinal, case-sensitive).</summary>
        public static bool TryGetCounterLabel(string scanType, out string label)
        {
            if (scanType == null)
            {
                label = null;
                return false;
            }

            return LabelsByScanType.TryGetValue(scanType, out label);
        }
    }
}
