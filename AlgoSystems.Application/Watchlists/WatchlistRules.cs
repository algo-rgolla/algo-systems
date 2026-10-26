using AlgoSystems.Domain.Entities.Models;

namespace AlgoSystems.Application.Watchlists
{
    public static class WatchlistRules
    {
        /// <summary>
        /// Whether a watchlisted stock is shown today, judged on its latest symbol detail snapshot.
        /// A missing (null) value fails the comparison it appears in.
        /// </summary>
        public static bool IsValidWatchlistItem(EodhdSymbolDetail product)
        {
            return (
                product.Ema21 > product.Ema63
                && product.MarketCapitalization > 200000000
                && product.ChangeP > (decimal)2.5
                && product.Close > (decimal?)product.Ema63
                && product.Volume > 300000
                && product.Close > (decimal?)product.PrevClose
                && product.ChangeP < (decimal)10
                && product.Macd > product.SignalLine
                && (product.Volume * product.Close) > 300000
            );
        }
    }
}
