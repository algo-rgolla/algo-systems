using AlgoSystems.Application.ProductScans;
using static AlgoSystems.Test.ProductScans.ScanTestData;

namespace AlgoSystems.Test.ProductScans
{
    /// <summary>
    /// The batch pre-filters and sizing, as implemented. Boundaries come from the comparison operators in the code.
    /// </summary>
    [SetCulture("en-AU")]
    public class ProductScanRulesTests
    {
        [Test]
        public void Au_PassingStock_IsNotExcluded()
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(), Technicals()), Is.False);
        }

        [TestCase(1.0, false)]
        [TestCase(0.99, true)]
        [TestCase(8.0, false)]
        [TestCase(8.01, true)]
        public void Au_ChangePercent_MustBeFrom1To8(double changeP, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(changeP: changeP), Technicals()), Is.EqualTo(excluded));
        }

        [Test]
        public void Au_MissingChangePercent_ReadsAsZeroAndIsExcluded()
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(changeP: null), Technicals()), Is.True);
        }

        [TestCase(300_000, false)]
        [TestCase(299_999, true)]
        public void Au_Volume_MustBeAtLeast300k(double volume, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(volume: volume), Technicals()), Is.EqualTo(excluded));
        }

        [TestCase(10.0, false)]
        [TestCase(10.01, true)]
        public void Au_CloseBelowEma21_IsExcluded(double ema21, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(close: 10), Technicals(ema21: ema21)), Is.EqualTo(excluded));
        }

        [Test]
        public void Au_NoEma21Data_SkipsTheEma21Check()
        {
            var technicals = Technicals(ema21: 100);
            technicals.Ema21 = Emas();

            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(), technicals), Is.False);
        }

        [TestCase(0.75, false)]
        [TestCase(0.74, true)]
        public void Au_Turnover_MustBeAtLeast300k(double close, bool excluded)
        {
            var live = Live(close: close, volume: 400_000);

            Assert.That(ProductScanRules.IsExcludedFromAuScans(live, Technicals(ema21: 0.1)), Is.EqualTo(excluded));
        }

        [TestCase(0.1, false)]
        [TestCase(0.11, true)]
        public void Au_MacdBelowSignal_IsExcluded(double signal, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(), Technicals(macd: 0.1, signal: signal)), Is.EqualTo(excluded));
        }

        [TestCase(25, false)]
        [TestCase(26, true)]
        public void Au_FiveDayGain_MustBeAtMost25(int gain, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(), Technicals(fiveDayGain: gain)), Is.EqualTo(excluded));
        }

        [Test]
        public void Au_HistogramNotIncreasing_IsExcluded()
        {
            Assert.That(ProductScanRules.IsExcludedFromAuScans(Live(), Technicals(histogramIncreasing: false)), Is.True);
        }

        // Existing behaviour: an empty MACD list throws, which ends the AU batch run.
        [Test]
        public void Au_NoMacdData_Throws()
        {
            var technicals = Technicals();
            technicals.Macd = Macds();

            Assert.That(() => ProductScanRules.IsExcludedFromAuScans(Live(), technicals), Throws.InstanceOf<ArgumentOutOfRangeException>());
        }

        [Test]
        public void Us_PassingPrice_IsNotExcluded()
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByPrice(Live()), Is.False);
        }

        [TestCase(1.0, false)]
        [TestCase(0.99, true)]
        [TestCase(10.0, false)]
        [TestCase(10.01, true)]
        public void Us_ChangePercent_MustBeFrom1To10(double changeP, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByPrice(Live(changeP: changeP)), Is.EqualTo(excluded));
        }

        [TestCase(300_000, false)]
        [TestCase(299_999, true)]
        public void Us_Volume_MustBeAtLeast300k(double volume, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByPrice(Live(close: 10, volume: volume)), Is.EqualTo(excluded));
        }

        [TestCase(2.0, false)]
        [TestCase(1.99, true)]
        public void Us_Turnover_MustBeAtLeast1m(double close, bool excluded)
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByPrice(Live(close: close, volume: 500_000)), Is.EqualTo(excluded));
        }

        [Test]
        public void Us_PassingTechnicals_AreNotExcluded()
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), Technicals()), Is.False);
        }

        [Test]
        public void Us_HistogramIsNotPartOfThePreFilter()
        {
            Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), Technicals(histogramIncreasing: false)), Is.False);
        }

        [Test]
        public void Us_MissingIndicatorData_IsExcluded()
        {
            var noMacd = Technicals();
            noMacd.Macd = null!;
            var emptyMacd = Technicals();
            emptyMacd.Macd = Macds();
            var noEma = Technicals();
            noEma.Ema21 = null!;
            var emptyEma = Technicals();
            emptyEma.Ema21 = Emas();

            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), noMacd), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), emptyMacd), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), noEma), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), emptyEma), Is.True);
            });
        }

        [Test]
        public void Us_CloseBelowEma21_MacdBelowSignal_OrFiveDayGainOver25_IsExcluded()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(close: 10), Technicals(ema21: 10.01)), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), Technicals(macd: 0.1, signal: 0.11)), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), Technicals(fiveDayGain: 26)), Is.True);
                Assert.That(ProductScanRules.IsExcludedFromUsScansByTechnicals(Live(), Technicals(fiveDayGain: 25)), Is.False);
            });
        }

        [Test]
        public void FiveDayGain_IsTheRoundedGainOverTheLowestClose()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(11, 10, 12), 12), Is.EqualTo(20));
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(8, 9), 8.25), Is.EqualTo(3));
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(8, null, 9), 8.25), Is.EqualTo(3));
            });
        }

        [Test]
        public void FiveDayGain_IsZero_WithoutAPositiveGainOrData()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(10), 10), Is.Zero);
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(10), 9), Is.Zero);
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(10), null), Is.Zero);
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(10), 0), Is.Zero);
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(null!, 10), Is.Zero);
                Assert.That(ProductScanRules.GetFiveDayPercentageGain(History(), 10), Is.Zero);
            });
        }

        // Existing behaviour: a history with no closes throws.
        [Test]
        public void FiveDayGain_HistoryWithoutCloses_Throws()
        {
            Assert.That(() => ProductScanRules.GetFiveDayPercentageGain(History(null, null), 10), Throws.InvalidOperationException);
        }

        [Test]
        public void PositionSize_RisksTheConfiguredAmountBetweenCloseAndStop()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.GetPositionSize(10m, 9), Is.EqualTo(1000));
                Assert.That(ProductScanRules.GetPositionSize(10m, 9.7), Is.EqualTo(3333));
                Assert.That(ProductScanRules.GetPositionSize(700m, 100), Is.EqualTo(2));
            });
        }

        [Test]
        public void PositionSize_RoundsHalfToEven()
        {
            Assert.That(ProductScanRules.GetPositionSize(500m, 100), Is.EqualTo(2));
        }

        [Test]
        public void PositionSize_IsZero_WithoutACloseOrAStopBelowIt()
        {
            Assert.Multiple(() =>
            {
                Assert.That(ProductScanRules.GetPositionSize(null, 9), Is.Zero);
                Assert.That(ProductScanRules.GetPositionSize(10m, 0), Is.Zero);
                Assert.That(ProductScanRules.GetPositionSize(10m, 10), Is.Zero);
                Assert.That(ProductScanRules.GetPositionSize(10m, 11), Is.Zero);
            });
        }
    }
}
