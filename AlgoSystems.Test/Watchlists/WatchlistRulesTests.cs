using AlgoSystems.Application.Watchlists;
using AlgoSystems.Domain.Entities.Models;

namespace AlgoSystems.Test.Watchlists
{
    public class WatchlistRulesTests
    {
        [Test]
        public void StockMeetingEveryRule_IsValid()
        {
            Assert.That(WatchlistRules.IsValidWatchlistItem(ValidDetail()), Is.True);
        }

        // Each case sits exactly on, or just past, one rule's boundary, or nulls one of its inputs.
        private static IEnumerable<TestCaseData> FailingCases()
        {
            yield return Case("EMA21 equal to EMA63", d => d.Ema21 = d.Ema63);
            yield return Case("Market cap at 200M", d => d.MarketCapitalization = 200_000_000);
            yield return Case("Change at 2.5%", d => d.ChangeP = 2.5m);
            yield return Case("Change at 10%", d => d.ChangeP = 10m);
            yield return Case("Close equal to EMA63", d => d.Close = d.Ema63);
            yield return Case("Volume at 300,000", d => d.Volume = 300_000);
            yield return Case("Close equal to previous close", d => d.PrevClose = d.Close);
            yield return Case("MACD equal to signal line", d => d.Macd = d.SignalLine);
            yield return Case("Turnover at 300,000", d =>
            {
                d.Volume = 600_000;
                d.Close = 0.50m;
                d.PrevClose = 0.45m;
                d.Ema63 = 0.40m;
                d.Ema21 = 0.42m;
            });
            yield return Case("Missing EMA21", d => d.Ema21 = null);
            yield return Case("Missing market cap", d => d.MarketCapitalization = null);
            yield return Case("Missing change", d => d.ChangeP = null);
            yield return Case("Missing close", d => d.Close = null);
            yield return Case("Missing volume", d => d.Volume = null);
            yield return Case("Missing previous close", d => d.PrevClose = null);
            yield return Case("Missing signal line", d => d.SignalLine = null);
        }

        [TestCaseSource(nameof(FailingCases))]
        public void StockBreakingARule_IsNotValid(Action<EodhdSymbolDetail> breakRule)
        {
            var detail = ValidDetail();
            breakRule(detail);

            Assert.That(WatchlistRules.IsValidWatchlistItem(detail), Is.False);
        }

        [Test]
        public void ChangeJustAboveTheMinimum_IsValid()
        {
            var detail = ValidDetail();
            detail.ChangeP = 2.5001m;

            Assert.That(WatchlistRules.IsValidWatchlistItem(detail), Is.True);
        }

        private static TestCaseData Case(string name, Action<EodhdSymbolDetail> breakRule)
            => new TestCaseData(breakRule).SetName(name);

        private static EodhdSymbolDetail ValidDetail() => new()
        {
            Code = "BHP",
            MarketCapitalization = 500_000_000,
            Close = 12.34m,
            PrevClose = 11.90m,
            ChangeP = 3.5m,
            Volume = 1_000_000,
            Ema21 = 11m,
            Ema63 = 10m,
            Macd = 0.2m,
            SignalLine = 0.1m,
        };
    }
}
