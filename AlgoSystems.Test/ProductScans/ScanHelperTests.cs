using AlgoSystems.Application.Common;
using AlgoSystems.Application.Models;
using AlgoSystems.BusinessLogic.Common;
using AlgoSystems.Domain.Entities.Models;
using EOD.Model;
using static AlgoSystems.Test.ProductScans.ScanTestData;

namespace AlgoSystems.Test.ProductScans
{
    /// <summary>
    /// The scan definitions and stop loss used by the batches, as implemented. Boundaries come from the comparison
    /// operators in the code; any exception inside a scan is swallowed and reads as "no hit".
    /// </summary>
    [SetCulture("en-AU")]
    public class ScanHelperTests
    {
        private static LiveStockPrice BigGainerLive(double close = 10, double changeP = 3, double volume = 500_000, double previousClose = 9.7)
            => Live(close: close, volume: volume, changeP: changeP, previousClose: previousClose);

        private static ProductTechnicalDetails BigGainerTechnicals(double ema21 = 9.6, double ema63 = 9.3, double ema125 = 9.0, bool histogramIncreasing = true)
            => new()
            {
                Ema21 = Emas(ema21),
                Ema63 = Emas(ema63),
                Ema125 = Emas(ema125),
                IsHistogramIncreasing = histogramIncreasing,
            };

        private static EodhdSymbolDetail Product(decimal? macd = 0.1m, decimal? avgVol50d = 400_000m)
            => new() { Code = "BHP", Macd = macd, Avgvol50d = avgVol50d };

        [Test]
        public void BigGainers_Hit()
        {
            Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(), Product()), Is.True);
        }

        [Test]
        public void BigGainers_Misses_WhenAnyConditionFails()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(close: 9.6), BigGainerTechnicals(), Product()), Is.False, "close not above EMA21");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(changeP: 2), BigGainerTechnicals(), Product()), Is.False, "change 2%");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(ema63: 9.6), Product()), Is.False, "EMA21 not above EMA63");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(ema125: 9.3), Product()), Is.False, "EMA63 not above EMA125");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(previousClose: 10), BigGainerTechnicals(), Product()), Is.False, "close not above previous close");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(), Product(macd: 0)), Is.False, "MACD not positive");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(), Product(macd: null)), Is.False, "MACD missing");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(histogramIncreasing: false), Product()), Is.False, "histogram");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(volume: 400_000), BigGainerTechnicals(), Product()), Is.False, "volume not above 50-day average");
                Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(), Product(avgVol50d: null)), Is.False, "50-day average missing");
            });
        }

        [TestCase(9.75, true)]  // 4.84% above EMA63
        [TestCase(9.8, false)]  // 5.38% above EMA63
        public void BigGainers_RequireEma21WithinFivePercentOfEma63(double ema21, bool hit)
        {
            Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), BigGainerTechnicals(ema21: ema21), Product()), Is.EqualTo(hit));
        }

        [Test]
        public void BigGainers_WithoutIndicatorData_Misses()
        {
            var technicals = BigGainerTechnicals();
            technicals.Ema125 = Emas();

            Assert.That(ScanHelper.IsBigGainers(BigGainerLive(), technicals, Product()), Is.False);
        }

        [TestCase(1_000_001, true)]
        [TestCase(1_000_000, false)]
        public void UnusualVolume_NeedsVolumeAboveTwoAndAHalfTimesThe50DayAverage(double volume, bool hit)
        {
            var live = Live(close: 10, volume: volume, changeP: 3);

            Assert.That(ScanHelper.IsUnusualVolume(live, Product(), Emas(9.6), Emas(9.3), Emas()), Is.EqualTo(hit));
        }

        [Test]
        public void UnusualVolume_Misses_WhenAnyConditionFails()
        {
            var live = Live(close: 10, volume: 1_100_000, changeP: 3);

            Assert.Multiple(() =>
            {
                Assert.That(ScanHelper.IsUnusualVolume(live, Product(), Emas(10), Emas(9.3), Emas()), Is.False, "close not above EMA21");
                Assert.That(ScanHelper.IsUnusualVolume(live, Product(), Emas(9.3), Emas(9.3), Emas()), Is.False, "EMA21 not above EMA63");
                Assert.That(ScanHelper.IsUnusualVolume(Live(close: 10, volume: 1_100_000, changeP: 2), Product(), Emas(9.6), Emas(9.3), Emas()), Is.False, "change 2%");
                Assert.That(ScanHelper.IsUnusualVolume(live, Product(), Emas(), Emas(), Emas()), Is.False, "no EMA data");
            });
        }

        [Test]
        public void UsUnusualVolume_Hit()
        {
            Assert.That(ScanHelper.IsUS_UnusualVolume(Live(changeP: 1.01), Product(), BigGainerTechnicals()), Is.True);
        }

        [Test]
        public void UsUnusualVolume_Misses_WhenAnyConditionFails()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(changeP: 1), Product(), BigGainerTechnicals()), Is.False, "change 1%");
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(volume: 400_000), Product(), BigGainerTechnicals()), Is.False, "volume not above 50-day average");
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(close: 9.6), Product(), BigGainerTechnicals()), Is.False, "close not above EMA21");
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(), Product(), BigGainerTechnicals(ema63: 9.6)), Is.False, "EMA21 not above EMA63");
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(), Product(), BigGainerTechnicals(histogramIncreasing: false)), Is.False, "histogram");
                Assert.That(ScanHelper.IsUS_UnusualVolume(Live(), Product(), BigGainerTechnicals(ema21: 9.8)), Is.False, "EMA21 over 5% from EMA63");
            });
        }

        [Test]
        public void HistogramIncreasing_ComparesTheLastThreeDivergences()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ScanHelper.IsHistogramIncreasing(Macds((0, 0, 0.5), (0, 0, 0.1), (0, 0, 0.2), (0, 0, 0.3))), Is.True);
                Assert.That(ScanHelper.IsHistogramIncreasing(Macds((0, 0, 0.1), (0, 0, 0.2), (0, 0, 0.2))), Is.False, "not strictly increasing");
                Assert.That(ScanHelper.IsHistogramIncreasing(Macds((0, 0, 0.3), (0, 0, 0.2), (0, 0, 0.1))), Is.False, "decreasing");
                Assert.That(ScanHelper.IsHistogramIncreasing(Macds((0, 0, 0.1), (0, 0, 0.2))), Is.False, "fewer than three");
                Assert.That(ScanHelper.IsHistogramIncreasing(null!), Is.False, "no data");
            });
        }

        // Existing behaviour: the crossover is found by counting back from the latest value, but the date returned
        // is read from the front of the list (ema21[i] rather than ema21[^i]).
        [Test]
        public void EmaCrossOverDate_ReturnsTheDateAtTheSameOffsetFromTheStart()
        {
            var ema21 = Emas(1, 1, 1, 1, 2);
            var ema63 = Emas(1.5, 1.5, 1.5, 1.5, 1.5);

            Assert.That(ScanHelper.GetEMACrossOverDate(ema21, ema63), Is.EqualTo(ema21[1].Date));
        }

        [Test]
        public void EmaCrossOverDate_IsNull_WithoutACrossover()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ScanHelper.GetEMACrossOverDate(Emas(2, 2, 2), Emas(1, 1, 1)), Is.Null);
                Assert.That(ScanHelper.GetEMACrossOverDate(Emas(1, 1, 1), Emas(2, 2, 2)), Is.Null);
                Assert.That(ScanHelper.GetEMACrossOverDate(null!, Emas(1)), Is.Null);
            });
        }

        [Test]
        public void StopLoss_IsTwoAtrsBelowTheClose_OrThreeForPennyStocks()
        {
            Assert.Multiple(() =>
            {
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 10m, Atr = 0.5m }), Is.EqualTo(9.0));
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 1m, Atr = 0.05m }), Is.EqualTo(0.9));
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 0.5m, Atr = 0.05m }), Is.EqualTo(0.35));
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 10m, Atr = 0.333m }), Is.EqualTo(9.33));
            });
        }

        [Test]
        public void StopLoss_IsZero_WithoutAPositiveAtr()
        {
            Assert.Multiple(() =>
            {
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 10m, Atr = null }), Is.Zero);
                Assert.That(Utils.GetStopLoss(new EodhdSymbolDetail { Close = 10m, Atr = 0m }), Is.Zero);
            });
        }

        // Existing behaviour: an ATR without a close throws.
        [Test]
        public void StopLoss_WithAtrButNoClose_Throws()
        {
            Assert.That(() => Utils.GetStopLoss(new EodhdSymbolDetail { Close = null, Atr = 0.5m }), Throws.InvalidOperationException);
        }
    }
}
