using System.Threading.Tasks;

public interface IEodhdDownloadService
{
    Task<bool> DownloadExchangeSymbols(string exchange);
    Task<bool> DownloadSymbolDetails_AUS(string exchange);
    Task<bool> DownloadSymbolDetails_US(string exchange);
    Task<bool> ClearStockScanData();
    Task<bool> ClearWatchlistData();
}
