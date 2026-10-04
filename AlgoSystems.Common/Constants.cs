using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Common
{

    public class Constants
    {
        //History Download
        public static int MarketCapInMillions = 150000000; //200M
        public static int NoOfDaysToDownload = 250;
        public static int DailyTurnover = 300000; //300K
        public static double StockPriceMinimum = 0.50;
        public static int ETF_MarketCap= 300000000; //300M

        //Sector Display
        public static int Sector_MinMarketCap = 100000000; //100M
        public static int Sector_MinStockPrice = 1;
        public static int Sector_MinDailyTurnover = 200000; //200K

        //Portfolio Constants
        public static int Portfolio_MaxNumberOfStocks = 15;
        public static int Portfolio_Capital = 300000;
        public static int Portfolio_Position_Risk = 1000;

        public static double ATR_Stock_Loss = 2;
        public static double ATR_Penny_Stock_Loss = 3;

        public static string[] AlgoScans = new string[] {
            Scans.LongEMACrossover,
            Scans.LongUnusualVolume,
            Scans.LongBigGainers };
    }
    public class StockAction
    {
        public const string BUY = "BUY";
        public const string SELL = "SELL";
    }

    public class Scans
    {
        //Long
        public static string LongMACDCrossover = "Scan_Long_MACD_Crossover";
        //public static string LongEMATrendStarters = "Scan_Long_EMA_TrendStarters"; // EMA9 > 21 > 63
        public static string LongEMACrossover = "Scan_Long_EMA_Crossover"; // EMA9 > 21 > 63
        public static string LongBigGainers = "Scan_LongBigGainers";
        public static string AlgoPortfolio = "Algo_Portfolio";
        public static string LongUnusualVolume= "Scan_Long_Unusual_Volume"; // EMA9 > 21 > 63

        public static string Long_CFD_US_BigGainers = "Scan_CFD_US_Long_BigGainers"; // EMA9 > 21 > 63
        public static string Short_CFD_US_BigLoosers = "Scan_CFD_US_Short_BigLoosers"; // EMA9 > 21 > 63
        
        public static string Long_CFD_US_UnusualVolume = "Long_CFD_US_UnusualVolume"; // EMA9 > 21 > 63

        //public static string LongMACDHistogram = "Scan_Long_MACD_Histogram"; // 3 days of Histogram in raise
        //public static string LongIntraday = "Scan_LongIntraday";



        //Short
        public static string ShortBigLoosers = "Scan_ShortBigLoosers";
        public static string ShortTrendStarters = "Scan_ShortTrendStarters";
        public static string ShortIntraday = "Scan_ShortIntraday";
    }
}
